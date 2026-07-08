const express = require('express');
const { getDashboardSummary } = require('../controllers/dashboardController');
const { requireAuth, requireRole } = require('../middleware/auth.middleware');

const router = express.Router();

// Get Dashboard Summary
router.get('/summary', requireRole(['GUEST_HOUSE_ADMIN', 'HOMEOWNER', 'HOTEL_MANAGER', 'RECEPTIONIST', 'ADMIN']), getDashboardSummary);

module.exports = router;
