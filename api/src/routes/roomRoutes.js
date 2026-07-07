const express = require('express');
const { getRoomsByProperty, updateRoom, appendRoomImage, createRoom } = require('../controllers/roomController');
const { requireRole } = require('../middleware/auth.middleware');

const router = express.Router();

router.get('/', requireRole(['GUEST_HOUSE_ADMIN', 'HOMEOWNER', 'HOTEL_MANAGER', 'RECEPTIONIST', 'ADMIN']), getRoomsByProperty);
router.post('/', requireRole(['GUEST_HOUSE_ADMIN', 'HOMEOWNER', 'HOTEL_MANAGER', 'ADMIN']), createRoom);
router.put('/:id', requireRole(['GUEST_HOUSE_ADMIN', 'HOMEOWNER', 'HOTEL_MANAGER', 'ADMIN']), updateRoom);
router.post('/:id/photos', requireRole(['GUEST_HOUSE_ADMIN', 'HOMEOWNER', 'HOTEL_MANAGER', 'ADMIN']), appendRoomImage);

module.exports = router;
