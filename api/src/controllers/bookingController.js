const prisma = require('../prismaClient');
const socket = require('../socket');

// Helper to check availability
const checkAvailability = async (property_id, room_id, check_in, check_out) => {
  // Find any bookings for this room/property that overlap with the requested dates
  const overlappingBookings = await prisma.booking.findMany({
    where: {
      property_id,
      ...(room_id && { room_id }),
      OR: [
        {
          check_in: { lt: new Date(check_out) },
          check_out: { gt: new Date(check_in) }
        }
      ]
    }
  });
  return overlappingBookings.length === 0;
};

// Booking Engine Route (For Guests)
exports.createBooking = async (req, res) => {
  try {
    const { property_id, room_id, check_in, check_out, total_amount } = req.body;
    const guest_id = req.user.id;

    const isAvailable = await checkAvailability(property_id, room_id, check_in, check_out);
    if (!isAvailable) {
      return res.status(400).json({ error: 'Room/Property is already booked for these dates' });
    }

    const booking = await prisma.booking.create({
      data: {
        guest_id,
        property_id,
        room_id,
        check_in: new Date(check_in),
        check_out: new Date(check_out),
        total_amount,
        booking_source: 'APP',
        status: 'PENDING'
      }
    });

    // Emit event to all connected clients (Dashboard Receptionists)
    const io = socket.getIo();
    if (io) {
      io.emit('bookingCreated', { booking });
    }

    res.status(201).json({ message: 'Booking created successfully', booking });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Quick Block Route (For RECEPTIONIST / GUEST_HOUSE_ADMIN)
exports.quickBlock = async (req, res) => {
  try {
    const { property_id, room_id, check_in, check_out } = req.body;

    const isAvailable = await checkAvailability(property_id, room_id, check_in, check_out);
    if (!isAvailable) {
      return res.status(400).json({ error: 'Room is already occupied/blocked for these dates' });
    }

    const block = await prisma.booking.create({
      data: {
        property_id,
        room_id,
        check_in: new Date(check_in),
        check_out: new Date(check_out),
        total_amount: 0, // Quick block assumes payment handled out of band or updated later
        booking_source: 'WALK_IN',
        status: 'CONFIRMED', // Assuming walk-in paid at desk or confirmed directly
      }
    });

    // Emit event to all connected clients (Dashboard Receptionists)
    const io = socket.getIo();
    if (io) {
      io.emit('bookingCreated', { booking: block });
    }

    res.status(201).json({ message: 'Room successfully blocked for walk-in', block });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get today's bookings for the Front Desk Queue
exports.getTodayBookings = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const propertyFilter = req.user.role === 'ADMIN' ? {} : { 
      property: {
        OR: [
          { owner_id: req.user.id },
          { staff: { some: { user_id: req.user.id } } }
        ]
      }
    };

    // Fetch bookings that overlap with today
    const bookings = await prisma.booking.findMany({
      where: {
        ...propertyFilter,
        AND: [
          { check_in: { lt: tomorrow } },
          { check_out: { gte: today } }
        ]
      },
      include: {
        guest: true,
        room: true
      }
    });

    const arrivals = [];
    const departures = [];
    const inHouse = [];

    bookings.forEach(booking => {
      const checkInDate = new Date(booking.check_in);
      const checkOutDate = new Date(booking.check_out);
      
      checkInDate.setHours(0,0,0,0);
      checkOutDate.setHours(0,0,0,0);

      if (checkInDate.getTime() === today.getTime()) {
        arrivals.push(booking);
      } else if (checkOutDate.getTime() === today.getTime()) {
        departures.push(booking);
      } else {
        inHouse.push(booking);
      }
    });

    res.status(200).json({ arrivals, departures, inHouse });
  } catch (error) {
    console.error('Error fetching today bookings:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Fetch available rooms for Walk-In modal
exports.getAvailableRooms = async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const propertyFilter = userRole === 'ADMIN' ? {} : { 
      property: {
        OR: [
          { owner_id: userId },
          { staff: { some: { user_id: userId } } }
        ]
      }
    };

    // Get rooms that do NOT have a booking overlapping with today
    const availableRooms = await prisma.room.findMany({
      where: {
        ...propertyFilter,
        status: 'AVAILABLE',
        bookings: {
          none: {
            status: { in: ['PENDING', 'CONFIRMED', 'BLOCKED'] },
            check_in: { lt: tomorrow },
            check_out: { gt: today }
          }
        }
      },
      select: {
        id: true,
        room_number: true,
        category: true
      }
    });

    res.status(200).json(availableRooms);
  } catch (error) {
    console.error('Error fetching available rooms:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Handle Walk-In Booking submission
exports.walkInBooking = async (req, res) => {
  try {
    const { guest_name, phone_number, room_id, check_out, payment_method } = req.body;
    
    if (!guest_name || !phone_number || !room_id || !check_out) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const room = await prisma.room.findUnique({
      where: { id: room_id },
      include: { category: true }
    });

    if (!room) {
      return res.status(404).json({ error: 'Room not found' });
    }

    const checkInDate = new Date();
    checkInDate.setHours(0, 0, 0, 0); // Start of today
    
    // Parse check_out without timezone issues by interpreting as local date
    const checkOutDate = new Date(check_out);
    checkOutDate.setHours(0, 0, 0, 0);
    
    // Ensure checkOutDate is strictly after checkInDate
    if (checkOutDate <= checkInDate) {
      return res.status(400).json({ error: 'Check-out date must be after today' });
    }
    
    const diffTime = checkOutDate - checkInDate;
    const diffDays = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
    
    const total_amount = room.category.price_per_night * diffDays;

    const isAvailable = await checkAvailability(room.property_id, room.id, checkInDate, checkOutDate);
    if (!isAvailable) {
      return res.status(400).json({ error: 'Room is already occupied for these dates' });
    }

    // Use a transaction to safely upsert user and create booking
    const booking = await prisma.$transaction(async (tx) => {
      // Create guest if not exists, or get existing
      let guest = await tx.user.findFirst({
        where: { phone_number }
      });
      
      if (!guest) {
        guest = await tx.user.create({
          data: {
            name: guest_name,
            phone_number,
            role: 'GUEST'
          }
        });
      }

      return tx.booking.create({
        data: {
          guest_id: guest.id,
          property_id: room.property_id,
          room_id: room.id,
          check_in: checkInDate,
          check_out: checkOutDate,
          total_amount,
          payment_method,
          booking_source: 'WALK_IN',
          status: 'CONFIRMED'
        },
        include: {
          guest: true,
          room: true,
          property: true
        }
      });
    });

    // Emit event
    const io = socket.getIo();
    if (io) {
      io.emit('bookingCreated', { booking });
    }

    res.status(201).json({
      message: 'Walk-in booking created successfully',
      booking
    });
  } catch (error) {
    console.error('Error processing walk-in booking:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Fetch 30-day timeline data
exports.getTimelineData = async (req, res) => {
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

    const today = new Date();
    today.setHours(0,0,0,0);
    const thirtyDaysFromNow = new Date(today);
    thirtyDaysFromNow.setDate(today.getDate() + 30);

    // Fetch all rooms for the user's properties
    const rooms = await prisma.room.findMany({
      where: propertyFilter,
      select: {
        id: true,
        room_number: true,
        category: true
      },
      orderBy: {
        room_number: 'asc'
      }
    });

    const roomIds = rooms.map(r => r.id);

    // Fetch bookings for these rooms that overlap with the 30-day window
    const bookings = await prisma.booking.findMany({
      where: {
        room_id: { in: roomIds },
        status: { not: 'CANCELLED' },
        AND: [
          { check_in: { lt: thirtyDaysFromNow } },
          { check_out: { gt: today } }
        ]
      },
      include: {
        guest: { select: { name: true } }
      }
    });

    const formattedBookings = bookings.map(b => ({
      id: b.id,
      room_id: b.room_id,
      guest_name: b.guest?.name || 'Walk-In Guest',
      check_in: b.check_in,
      check_out: b.check_out,
      status: b.status
    }));

    res.status(200).json({ rooms, bookings: formattedBookings });
  } catch (error) {
    console.error('Error fetching timeline data:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Fetch single booking details
exports.getBookingById = async (req, res) => {
  try {
    const { id } = req.params;

    const booking = await prisma.booking.findUnique({
      where: { id },
      include: {
        guest: true,
        room: true,
        property: true
      }
    });

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    res.status(200).json(booking);
  } catch (error) {
    console.error('Error fetching booking details:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Update booking status
exports.updateBookingStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const updatedBooking = await prisma.booking.update({
      where: { id },
      data: { status }
    });

    // Emit event
    const io = socket.getIo();
    if (io) {
      io.emit('bookingUpdated', { booking: updatedBooking });
      // We can also emit bookingCreated as a catchall for timeline invalidation
      io.emit('bookingCreated', { booking: updatedBooking });
    }

    res.status(200).json({ message: 'Booking status updated successfully', booking: updatedBooking });
  } catch (error) {
    console.error('Error updating booking status:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Fetch all bookings for the manager's properties
exports.getAllBookings = async (req, res) => {
  try {
    const userId = req.user.id;
    let bookings;

    if (req.user.role === 'ADMIN') {
      bookings = await prisma.booking.findMany({
        include: { guest: true, room: true, property: true },
        orderBy: { check_in: 'desc' }
      });
    } else {
      bookings = await prisma.booking.findMany({
        where: { property: { owner_id: userId } },
        include: { guest: true, room: true, property: true },
        orderBy: { check_in: 'desc' }
      });
    }
    
    res.status(200).json(bookings);
  } catch (error) {
    console.error('Error fetching all bookings:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
