const express = require('express');
const { getMyProperties, createProperty, updateProperty, getStaff, addStaff, removeStaff } = require('../controllers/propertyController');
const { requireRole } = require('../middleware/auth.middleware');

const router = express.Router();

router.get('/', requireRole(['GUEST_HOUSE_ADMIN', 'HOMEOWNER', 'HOTEL_MANAGER', 'RECEPTIONIST', 'ADMIN']), getMyProperties);
router.post('/', requireRole(['GUEST_HOUSE_ADMIN', 'HOMEOWNER', 'HOTEL_MANAGER', 'ADMIN']), createProperty);
router.put('/:id', requireRole(['GUEST_HOUSE_ADMIN', 'HOMEOWNER', 'HOTEL_MANAGER', 'ADMIN']), updateProperty);

// Staff management routes
const adminRoles = ['GUEST_HOUSE_ADMIN', 'HOMEOWNER', 'HOTEL_MANAGER', 'ADMIN'];
router.get('/:id/staff', requireRole(adminRoles), getStaff);
router.post('/:id/staff', requireRole(adminRoles), addStaff);
router.delete('/:id/staff/:staffId', requireRole(adminRoles), removeStaff);

module.exports = router;
