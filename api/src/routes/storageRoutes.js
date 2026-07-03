const express = require('express');
const { getUploadUrl } = require('../controllers/storageController');
const { requireAuth } = require('../middleware/auth.middleware');

const router = express.Router();

// Get Presigned Upload URL (Authenticated users only)
router.post('/upload-url', requireAuth, getUploadUrl);

module.exports = router;
