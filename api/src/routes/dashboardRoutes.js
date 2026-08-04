const express = require('express');
const { getDashboardSummary } = require('../controllers/dashboardController');
const { requireAuth, requireRole } = require('../middleware/auth.middleware');

const router = express.Router();

// Get Dashboard Summary
router.get('/summary', requireRole(['GUEST_HOUSE_ADMIN', 'HOMEOWNER', 'HOTEL_MANAGER', 'RECEPTIONIST', 'ADMIN']), getDashboardSummary);

// Get Apartment Dashboard Summary
router.get('/apartment-summary', requireRole(['GUEST_HOUSE_ADMIN', 'HOMEOWNER', 'HOTEL_MANAGER', 'RECEPTIONIST', 'ADMIN']), require('../controllers/dashboardController').getApartmentSummary);

router.get('/apartment-buildings', requireRole(['HOMEOWNER', 'ADMIN']), require('../controllers/dashboardController').getApartmentBuildings);
router.get('/apartment-units', requireRole(['HOMEOWNER', 'ADMIN']), require('../controllers/dashboardController').getApartmentUnits);
router.get('/apartment-tenants', requireRole(['HOMEOWNER', 'ADMIN']), require('../controllers/dashboardController').getApartmentTenants);

module.exports = router;
