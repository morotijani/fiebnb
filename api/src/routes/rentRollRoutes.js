const express = require('express');
const router = express.Router();
const rentRollController = require('../controllers/rentRollController');
const { requireAuth, requireRole } = require('../middleware/auth.middleware');

router.use(requireAuth);
router.use(requireRole(['HOMEOWNER', 'APARTMENT_ADMIN', 'ADMIN']));

router.get('/', rentRollController.getRentRoll);
router.get('/:lease_id/payments', rentRollController.getLeasePayments);
router.post('/:lease_id/generate', rentRollController.generatePayments);
router.put('/payments/:payment_id/pay', rentRollController.markPaymentPaid);

module.exports = router;
