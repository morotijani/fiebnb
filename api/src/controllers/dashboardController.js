const prisma = require('../prismaClient');

exports.getDashboardSummary = async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    // Common filter to scope queries to the user's properties (if they aren't ADMIN)
    const propertyFilter = userRole === 'ADMIN' ? {} : { 
      property: {
        OR: [
          { owner_id: userId },
          { staff: { some: { user_id: userId } } }
        ]
      } 
    };

    // 1. Today's Check-ins
    // Count of bookings where check_in is >= today and < tomorrow
    const checkInsToday = await prisma.booking.count({
      where: {
        ...propertyFilter,
        check_in: {
          gte: today,
          lt: tomorrow
        },
        status: {
          in: ['PENDING', 'CONFIRMED', 'COMPLETED']
        }
      }
    });

    // 2. Today's Revenue
    // Sum of total_amount for bookings checking in today
    const revenueAgg = await prisma.booking.aggregate({
      _sum: {
        total_amount: true
      },
      where: {
        ...propertyFilter,
        check_in: {
          gte: today,
          lt: tomorrow
        },
        status: {
          in: ['PENDING', 'CONFIRMED', 'COMPLETED']
        }
      }
    });
    const todaysRevenue = revenueAgg._sum.total_amount || 0;

    const yesterdayRevenueAgg = await prisma.booking.aggregate({
      _sum: {
        total_amount: true
      },
      where: {
        ...propertyFilter,
        check_in: {
          gte: yesterday,
          lt: today
        },
        status: {
          in: ['PENDING', 'CONFIRMED', 'COMPLETED']
        }
      }
    });
    const yesterdaysRevenue = yesterdayRevenueAgg._sum.total_amount || 0;

    let revenueGrowth = 0;
    if (yesterdaysRevenue === 0) {
      if (todaysRevenue > 0) revenueGrowth = 100;
    } else {
      revenueGrowth = ((todaysRevenue - yesterdaysRevenue) / yesterdaysRevenue) * 100;
    }

    // 3. Available Rooms
    // Total rooms minus rooms occupied today
    const totalRooms = await prisma.room.count({
      where: propertyFilter
    });

    const occupiedRooms = await prisma.booking.count({
      where: {
        ...propertyFilter,
        status: {
          in: ['PENDING', 'CONFIRMED', 'BLOCKED']
        },
        AND: [
          { check_in: { lt: tomorrow } },
          { check_out: { gt: today } }
        ]
      }
    });
    const availableRooms = Math.max(0, totalRooms - occupiedRooms);

    // 4. Recent Activity
    // Fetch the 5 most recently created or updated bookings
    const recentActivity = await prisma.booking.findMany({
      where: propertyFilter,
      orderBy: {
        updatedAt: 'desc'
      },
      take: 5,
      include: {
        guest: {
          select: { name: true }
        },
        property: {
          select: { title: true }
        },
        room: {
          select: { room_number: true }
        }
      }
    });

    // Format recent activity
    const formattedActivity = recentActivity.map(booking => {
      let action = 'Booking updated';
      // Determine roughly what happened based on status
      if (booking.status === 'PENDING') action = 'New booking request';
      if (booking.status === 'CONFIRMED') action = 'Booking confirmed';
      if (booking.status === 'CANCELLED') action = 'Booking cancelled';
      if (booking.status === 'COMPLETED') action = 'Guest checked out';

      return {
        id: booking.id,
        guest_name: booking.guest?.name || 'Walk-In Guest',
        property_name: booking.property?.title,
        room_number: booking.room?.room_number,
        action,
        status: booking.status,
        timestamp: booking.updatedAt
      };
    });

    res.status(200).json({
      checkInsToday,
      availableRooms,
      todaysRevenue,
      revenueGrowth,
      recentActivity: formattedActivity
    });
  } catch (error) {
    console.error('Error fetching dashboard summary:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.getApartmentSummary = async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;
    
    const propertyFilter = userRole === 'ADMIN' ? {} : { 
      property: {
        OR: [
          { owner_id: userId },
          { staff: { some: { user_id: userId } } }
        ]
      } 
    };

    const properties = await prisma.property.findMany({
      where: userRole === 'ADMIN' ? {} : {
        OR: [
          { owner_id: userId },
          { staff: { some: { user_id: userId } } }
        ]
      },
      include: {
        rooms: true
      }
    });

    let totalUnits = 0;
    properties.forEach(p => totalUnits += p.rooms.length);

    const today = new Date();
    
    // 1. Occupied Units
    const occupiedRooms = await prisma.lease.count({
      where: {
        property: propertyFilter.property || {},
        status: 'ACTIVE',
        start_date: { lte: today },
        end_date: { gte: today }
      }
    });

    // 2. Rent Collected
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    const revenueAgg = await prisma.tenantPayment.aggregate({
      _sum: { amount: true },
      where: {
        lease: { property: propertyFilter.property || {} },
        paid_date: { gte: startOfMonth, lte: endOfMonth },
        status: 'PAID'
      }
    });
    const rentCollected = revenueAgg._sum.amount || 0;

    const activeLeases = await prisma.lease.findMany({
      where: {
        property: propertyFilter.property || {},
        status: 'ACTIVE',
        start_date: { lte: today },
        end_date: { gte: today }
      }
    });

    const portfolioList = properties.map(p => {
      const units = p.rooms.length;
      const occupiedUnitsForProperty = activeLeases.filter(l => l.property_id === p.id).length;
      const occupancy = units > 0 ? Math.round((occupiedUnitsForProperty / units) * 100) : 0;
      const monthlyRent = activeLeases
        .filter(l => l.property_id === p.id)
        .reduce((sum, lease) => sum + lease.rent_amount, 0);

      return {
        id: p.id,
        title: p.title,
        location: p.address || p.city || 'Accra',
        units,
        occupancy,
        monthlyRent,
        image: p.images && p.images.length > 0 
          ? (p.images[0].startsWith('http') 
              ? p.images[0] 
              : `http://localhost:3000/uploads/${p.images[0].replace(/^(\/?uploads\/|\/)/, '')}`)
          : `https://picsum.photos/seed/bldg${p.id}/500/300`
      };
    });

    // 3. Lease Expirations (Next 60 days)
    const sixtyDaysFromNow = new Date(today);
    sixtyDaysFromNow.setDate(sixtyDaysFromNow.getDate() + 60);
    const expiringLeases = await prisma.lease.findMany({
      where: {
        property: propertyFilter.property || {},
        status: 'ACTIVE',
        end_date: { gte: today, lte: sixtyDaysFromNow }
      },
      include: { room: true, property: true, tenant: true },
      orderBy: { end_date: 'asc' },
      take: 5
    });
    
    const leaseExpirations = expiringLeases.map(l => {
      const d = new Date(l.end_date);
      return {
        id: l.id,
        date: d.getDate().toString().padStart(2, '0'),
        month: d.toLocaleString('default', { month: 'short' }),
        unit: `Unit ${l.room.room_number}, ${l.property.title}`,
        description: `Tenant: ${l.tenant_name || l.tenant?.name || 'Unknown'}`
      };
    });

    // 4. Maintenance Queue
    const maintenanceTickets = await prisma.maintenanceTicket.findMany({
      where: {
        property: propertyFilter.property || {},
        status: { not: 'RESOLVED' }
      },
      include: { property: true, room: true },
      orderBy: { createdAt: 'desc' },
      take: 5
    });
    const openMaintenanceTickets = await prisma.maintenanceTicket.count({
      where: {
        property: propertyFilter.property || {},
        status: { not: 'RESOLVED' }
      }
    });
    const maintenanceQueue = maintenanceTickets.map(t => ({
      id: t.id,
      type: t.type,
      title: t.title,
      location: `${t.property.title}${t.room ? ', Room ' + t.room.room_number : ''}`,
      status: t.status === 'URGENT' ? 'urgent' : t.status === 'IN_PROGRESS' ? 'due' : 'vacant' 
    }));

    // 5. Rent Roll (Current month payments due/paid)
    const payments = await prisma.tenantPayment.findMany({
      where: {
        lease: { property: propertyFilter.property || {} },
        due_date: { gte: startOfMonth, lte: endOfMonth }
      },
      include: { lease: { include: { room: true, property: true, tenant: true } } },
      orderBy: { due_date: 'desc' },
      take: 10
    });

    const rentRoll = payments.map(p => ({
      id: p.id,
      unit: p.lease.room.room_number,
      building: p.lease.property.title,
      tenant: p.lease.tenant_name || p.lease.tenant?.name || 'Unknown',
      rent: `GH₵${p.amount.toLocaleString()}/mo`,
      status: p.status.toLowerCase()
    }));

    res.status(200).json({
      totalUnits,
      occupiedUnits: occupiedRooms,
      rentCollected,
      openMaintenanceTickets,
      portfolioList,
      leaseExpirations,
      maintenanceQueue,
      rentRoll
    });
  } catch (error) {
    console.error('Apartment summary error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.getApartmentBuildings = async (req, res) => {
  try {
    const userId = req.user.id;
    const properties = await prisma.property.findMany({
      where: { owner_id: userId, property_type: 'APARTMENT' },
      include: { rooms: true }
    });
    res.status(200).json(properties);
  } catch (error) {
    console.error('Error fetching apartment buildings:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.getApartmentUnits = async (req, res) => {
  try {
    const userId = req.user.id;
    const units = await prisma.room.findMany({
      where: { property: { owner_id: userId, property_type: 'APARTMENT' } },
      include: { property: true, category: true, leases: { where: { status: 'ACTIVE' } } },
      orderBy: [{ property_id: 'asc' }, { room_number: 'asc' }]
    });
    res.status(200).json(units);
  } catch (error) {
    console.error('Error fetching apartment units:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.getApartmentTenants = async (req, res) => {
  try {
    const userId = req.user.id;
    const tenants = await prisma.lease.findMany({
      where: { property: { owner_id: userId, property_type: 'APARTMENT' } },
      include: { property: true, room: true, tenant: true },
      orderBy: { start_date: 'desc' }
    });
    res.status(200).json(tenants);
  } catch (error) {
    console.error('Error fetching apartment tenants:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
