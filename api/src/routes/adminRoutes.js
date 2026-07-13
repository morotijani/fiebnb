const express = require('express');
const { resolveDispute, getEvidenceUrls } = require('../controllers/disputeController');
const { getStats, getOnboardingRequests, approveRequest, rejectRequest, getUsers, getProperties } = require('../controllers/adminController');
const { requireAdmin, requireAuth } = require('../middleware/auth.middleware');

const router = express.Router();

// Admin resolves dispute
router.post('/disputes/:id/resolve', requireAdmin, resolveDispute);

// Admin gets private evidence URLs
router.get('/disputes/:id/evidence-urls', requireAdmin, getEvidenceUrls);

// System Admin Dashboard Routes
router.get('/stats', requireAuth, requireAdmin, getStats);
router.get('/onboarding-requests', requireAuth, requireAdmin, getOnboardingRequests);
router.post('/onboarding-requests/:id/approve', requireAuth, requireAdmin, approveRequest);
router.post('/onboarding-requests/:id/reject', requireAuth, requireAdmin, rejectRequest);
router.get('/users', requireAuth, requireAdmin, getUsers);
router.get('/properties', requireAuth, requireAdmin, getProperties);

module.exports = router;
