const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const { requireAuth, requireRole } = require('../middleware/auth.middleware');

router.use(requireAuth);

router.get('/', requireRole(['ADMIN', 'HOTEL_MANAGER', 'GUEST_HOUSE_ADMIN', 'HOMEOWNER']), categoryController.getCategories);
router.post('/', requireRole(['ADMIN', 'HOTEL_MANAGER', 'GUEST_HOUSE_ADMIN', 'HOMEOWNER']), categoryController.addCategory);
router.put('/:id', requireRole(['ADMIN', 'HOTEL_MANAGER', 'GUEST_HOUSE_ADMIN', 'HOMEOWNER']), categoryController.updateCategory);
router.delete('/:id', requireRole(['ADMIN', 'HOTEL_MANAGER', 'GUEST_HOUSE_ADMIN', 'HOMEOWNER']), categoryController.deleteCategory);

module.exports = router;
