const express = require('express');
const { initiateDispute } = require('../controllers/disputeController');
const { requireRole } = require('../middleware/auth.middleware');

const router = express.Router();

// Guest initiates dispute
router.post('/:bookingId', requireRole(['GUEST']), initiateDispute);

module.exports = router;
