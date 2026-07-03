const express = require('express');
const { momoWebhook } = require('../controllers/webhookController');
const { hubtelWebhook } = require('../controllers/hubtelWebhookController');

const router = express.Router();

// Existing webhook
router.post('/momo', momoWebhook);

// New Hubtel Webhook
router.post('/hubtel', hubtelWebhook);

module.exports = router;
