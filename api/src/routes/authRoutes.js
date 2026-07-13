const express = require('express');
const { register, login, refresh, verifyOtp, resendOtp, getProfile, updateProfile, updatePassword } = require('../controllers/authController');
const { validate } = require('../middleware/validate.middleware');
const { otpLimiter } = require('../middleware/rateLimiter');
const { registerSchema, loginSchema, otpSchema } = require('../schemas/auth.schema');
const { requireAuth } = require('../middleware/auth.middleware');

const router = express.Router();

router.post('/register', otpLimiter, validate(registerSchema), register);
router.post('/verify-otp', validate(otpSchema), verifyOtp);
router.post('/resend-otp', otpLimiter, resendOtp);
router.post('/login', validate(loginSchema), login);
router.post('/refresh', refresh);

// Profile
router.get('/profile', requireAuth, getProfile);
router.put('/profile', requireAuth, updateProfile);

// Password
router.put('/password', requireAuth, updatePassword);

module.exports = router;
