const rateLimit = require('express-rate-limit');

const otpLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // Limit each IP to 3 requests per hour
  message: { status: 'error', message: 'Too many OTP requests from this IP. Try again in an hour.' },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = {
  otpLimiter
};
