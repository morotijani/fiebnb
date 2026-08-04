const express = require('express');
const router = express.Router();
const maintenanceController = require('../controllers/maintenanceController');
const { requireAuth, requireRole } = require('../middleware/auth.middleware');

router.use(requireAuth);
// Assuming HOMEOWNER handles these for their properties
router.use(requireRole(['HOMEOWNER', 'ADMIN', 'GUEST'])); // GUEST added for future tenant access

router.get('/', maintenanceController.getTickets);
router.post('/', maintenanceController.createTicket);
router.put('/:id', maintenanceController.updateTicket);
router.delete('/:id', maintenanceController.deleteTicket);

module.exports = router;
