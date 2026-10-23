const express = require('express');
const router = express.Router();
const leaseController = require('../controllers/leaseController');
const { requireAuth, requireRole } = require('../middleware/auth.middleware');

router.use(requireAuth);

// Guest-facing lease application
router.post('/apply', leaseController.applyForLease);

// Host / Admin lease management
router.use(requireRole(['HOMEOWNER', 'APARTMENT_ADMIN', 'ADMIN']));

router.post('/', leaseController.createLease);
router.put('/:id', leaseController.updateLease);
router.delete('/:id', leaseController.deleteLease);

module.exports = router;
