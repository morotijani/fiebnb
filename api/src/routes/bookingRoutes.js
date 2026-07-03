const express = require('express');
const { createBooking, quickBlock, getTodayBookings, getAvailableRooms, walkInBooking, getTimelineData, getBookingById, updateBookingStatus } = require('../controllers/bookingController');
const { requireAuth, requireRole } = require('../middleware/auth.middleware');

const router = express.Router();

// Guest booking an app reservation
router.post('/', requireRole(['GUEST']), createBooking);

// Quick block for Receptionists / Admins
router.post('/quick-block', requireRole(['RECEPTIONIST', 'GUEST_HOUSE_ADMIN', 'HOMEOWNER', 'HOTEL_MANAGER']), quickBlock);

// Front desk queue - today's bookings
router.get('/today', requireRole(['RECEPTIONIST', 'GUEST_HOUSE_ADMIN', 'HOMEOWNER', 'HOTEL_MANAGER', 'ADMIN']), getTodayBookings);

// Get available rooms for walk-in
router.get('/available-rooms', requireRole(['RECEPTIONIST', 'GUEST_HOUSE_ADMIN', 'HOMEOWNER', 'HOTEL_MANAGER', 'ADMIN']), getAvailableRooms);

// Process a new walk-in booking
router.post('/walk-in', requireRole(['RECEPTIONIST', 'GUEST_HOUSE_ADMIN', 'HOMEOWNER', 'HOTEL_MANAGER', 'ADMIN']), walkInBooking);

// Get timeline data
router.get('/timeline', requireRole(['RECEPTIONIST', 'GUEST_HOUSE_ADMIN', 'HOMEOWNER', 'HOTEL_MANAGER', 'ADMIN']), getTimelineData);

// Get single booking by ID
router.get('/:id', requireRole(['RECEPTIONIST', 'GUEST_HOUSE_ADMIN', 'HOMEOWNER', 'HOTEL_MANAGER', 'ADMIN']), getBookingById);

// Update booking status
router.put('/:id/status', requireRole(['RECEPTIONIST', 'GUEST_HOUSE_ADMIN', 'HOMEOWNER', 'HOTEL_MANAGER', 'ADMIN']), updateBookingStatus);

module.exports = router;
