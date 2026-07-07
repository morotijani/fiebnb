const express = require('express');
const { getMyProperties, createProperty, updateProperty } = require('../controllers/propertyController');
const { requireRole } = require('../middleware/auth.middleware');

const router = express.Router();

router.get('/', requireRole(['GUEST_HOUSE_ADMIN', 'HOMEOWNER', 'HOTEL_MANAGER', 'RECEPTIONIST', 'ADMIN']), getMyProperties);
router.post('/', requireRole(['GUEST_HOUSE_ADMIN', 'HOMEOWNER', 'HOTEL_MANAGER', 'ADMIN']), createProperty);
router.put('/:id', requireRole(['GUEST_HOUSE_ADMIN', 'HOMEOWNER', 'HOTEL_MANAGER', 'ADMIN']), updateProperty);

module.exports = router;
