const express = require('express');
const { resolveDispute, getEvidenceUrls } = require('../controllers/disputeController');
const { requireAdmin } = require('../middleware/auth.middleware');

const router = express.Router();

// Admin resolves dispute
router.post('/disputes/:id/resolve', requireAdmin, resolveDispute);

// Admin gets private evidence URLs
router.get('/disputes/:id/evidence-urls', requireAdmin, getEvidenceUrls);

module.exports = router;
