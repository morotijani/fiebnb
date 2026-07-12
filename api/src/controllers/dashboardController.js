const prisma = require('../prismaClient');

exports.getDashboardSummary = async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

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
      recentActivity: formattedActivity
    });
  } catch (error) {
    console.error('Error fetching dashboard summary:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
