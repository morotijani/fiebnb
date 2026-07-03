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

    // Fetch bookings that overlap with today
    const bookings = await prisma.booking.findMany({
      where: {
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
    // For scaffolding/preview purposes, return mock available rooms
    // In production, this queries the Room table where no overlapping Bookings exist
    const mockAvailableRooms = [
      { id: 'r1', room_number: '101', price_per_night: 150 },
      { id: 'r2', room_number: '105', price_per_night: 200 },
      { id: 'r3', room_number: '202', price_per_night: 180 },
    ];
    res.status(200).json(mockAvailableRooms);
  } catch (error) {
    console.error('Error fetching available rooms:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Handle Walk-In Booking submission
exports.walkInBooking = async (req, res) => {
  try {
    const { guest_name, phone_number, room_id, check_out, payment_method, property_id } = req.body;
    
    // In production:
    // 1. Look up or create User with phone_number
    // 2. Create Booking linking the User and Room
    // 3. Mark Room as unavailable for the period

    // Mock successful response
    const booking = {
      id: 'mock-booking-123',
      status: 'CONFIRMED',
      payment_method,
      booking_source: 'WALK_IN'
    };

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
    // For scaffolding/preview purposes, return mock timeline data
    // In production, this queries the Room and Booking tables based on the date range
    const today = new Date();
    today.setHours(0,0,0,0);
    
    const mockRooms = [
      { id: 'r1', room_number: '101 - Deluxe', price_per_night: 150 },
      { id: 'r2', room_number: '102 - Standard', price_per_night: 100 },
      { id: 'r3', room_number: '105 - Suite', price_per_night: 200 },
      { id: 'r4', room_number: '202 - Deluxe', price_per_night: 180 },
      { id: 'r5', room_number: '204 - Economy', price_per_night: 80 },
    ];

    // Create some mock bookings offset from today
    const createDate = (daysOffset) => {
      const d = new Date(today);
      d.setDate(d.getDate() + daysOffset);
      return d.toISOString();
    };

    const mockBookings = [
      { id: 'b1', room_id: 'r1', guest_name: 'Alice Smith', check_in: createDate(0), check_out: createDate(3), status: 'CONFIRMED' },
      { id: 'b2', room_id: 'r1', guest_name: 'Walk-In', check_in: createDate(4), check_out: createDate(6), status: 'COMPLETED' },
      { id: 'b3', room_id: 'r2', guest_name: 'Maintenance', check_in: createDate(1), check_out: createDate(5), status: 'BLOCKED' },
      { id: 'b4', room_id: 'r3', guest_name: 'Charlie Brown', check_in: createDate(-2), check_out: createDate(2), status: 'CONFIRMED' },
      { id: 'b5', room_id: 'r4', guest_name: 'Diana Prince', check_in: createDate(10), check_out: createDate(15), status: 'PENDING' },
      { id: 'b6', room_id: 'r5', guest_name: 'Bruce Wayne', check_in: createDate(20), check_out: createDate(25), status: 'CONFIRMED' },
    ];

    res.status(200).json({ rooms: mockRooms, bookings: mockBookings });
  } catch (error) {
    console.error('Error fetching timeline data:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Fetch single booking details
exports.getBookingById = async (req, res) => {
  try {
    const { id } = req.params;
    
    // For scaffolding, check if it's a mock ID from the frontend mock data
    if (id.startsWith('b') || id.startsWith('mock')) {
      return res.status(200).json({
        id,
        guest: { name: id === 'b1' ? 'Alice Smith' : 'Walk-In Guest', email: 'guest@example.com', phone: '123-456-7890' },
        room: { room_number: '101 - Deluxe', type: 'DELUXE' },
        check_in: new Date().toISOString(),
        check_out: new Date(new Date().setDate(new Date().getDate() + 3)).toISOString(),
        status: id === 'b3' ? 'BLOCKED' : 'CONFIRMED',
        total_amount: 450,
        payment_method: 'POS',
        booking_source: 'WALK_IN',
        createdAt: new Date().toISOString()
      });
    }

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

    // For scaffolding mock data
    if (id.startsWith('b') || id.startsWith('mock')) {
      const io = socket.getIo();
      if (io) io.emit('bookingUpdated', { id, status });
      return res.status(200).json({ message: `Mock booking status updated to ${status}` });
    }

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
