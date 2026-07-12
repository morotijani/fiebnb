const express = require('express');
const { getUploadUrl, uploadFiles } = require('../controllers/storageController');
const { requireAuth } = require('../middleware/auth.middleware');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

const router = express.Router();

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer config for local storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const extension = path.extname(file.originalname);
    cb(null, `${uuidv4()}${extension}`);
  }
});
const upload = multer({ storage });

// Get Presigned Upload URL (Legacy / Cloudflare)
router.post('/upload-url', requireAuth, getUploadUrl);

// Local file upload
router.post('/upload', requireAuth, upload.array('files', 10), uploadFiles);

module.exports = router;
