const express = require('express');
const { getMyProperties } = require('../controllers/propertyController');
const { requireRole } = require('../middleware/auth.middleware');

const router = express.Router();

router.get('/', requireRole(['GUEST_HOUSE_ADMIN', 'HOMEOWNER', 'HOTEL_MANAGER', 'RECEPTIONIST', 'ADMIN']), getMyProperties);

module.exports = router;
