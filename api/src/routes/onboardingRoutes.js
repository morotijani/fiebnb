const express = require('express');
const { upgradeToHomeowner, requestHotelManagerUpgrade, submitOnboarding } = require('../controllers/onboardingController');
const { requireAuth } = require('../middleware/auth.middleware');
const { validate } = require('../middleware/validate.middleware');
const { hotelManagerUpgradeSchema, homeownerUpgradeSchema, unifiedOnboardingSchema } = require('../schemas/auth.schema');

const router = express.Router();

router.post('/submit', requireAuth, validate(unifiedOnboardingSchema), submitOnboarding);
router.post('/homeowner', requireAuth, validate(homeownerUpgradeSchema), upgradeToHomeowner);
router.post('/hotel-manager', requireAuth, validate(hotelManagerUpgradeSchema), requestHotelManagerUpgrade);

module.exports = router;
