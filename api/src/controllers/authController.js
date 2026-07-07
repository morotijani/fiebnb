const prisma = require('../prismaClient');
const { hashPassword, comparePassword } = require('../utils/hash');
const { generateAccessToken, generateRefreshToken } = require('../utils/jwt');
const jwt = require('jsonwebtoken');
const smsService = require('../services/sms.service');

exports.register = async (req, res) => {
  const { name, email, password, phone_number, role } = req.body;
  if (!name || !email || !password || !phone_number) {
    return res.status(400).json({ error: 'Name, email, password, and phone_number are required' });
  }

  try {
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email }, { phone_number }]
      }
    });

    if (existingUser) {
      return res.status(400).json({ error: 'Email or phone number already in use' });
    }

    const password_hash = await hashPassword(password);
    
    // Fallback role to GUEST if not specified
    const userRole = role || 'GUEST';

    const user = await prisma.user.create({
      data: {
        name,
        email,
        phone_number,
        password_hash,
        role: userRole,
        is_phone_verified: false
      }
    });

    // Generate 6-digit OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    await prisma.otpVerification.create({
      data: {
        user_id: user.id,
        phone_number: user.phone_number,
        otp_code: otpCode,
        expires_at: expiresAt
      }
    });

    // Send SMS
    await smsService.sendOtpSms(user.phone_number, otpCode);

    res.status(201).json({
      message: 'Registration successful. OTP sent to your phone number.',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone_number: user.phone_number,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.verifyOtp = async (req, res) => {
  const { phone_number, otp_code } = req.body;

  if (!phone_number || !otp_code) {
    return res.status(400).json({ error: 'Phone number and OTP code are required' });
  }

  try {
    const verificationRecord = await prisma.otpVerification.findFirst({
      where: { phone_number },
      orderBy: { created_at: 'desc' }
    });

    if (!verificationRecord) {
      return res.status(400).json({ error: 'No OTP request found for this phone number' });
    }

    if (verificationRecord.expires_at < new Date()) {
      return res.status(400).json({ error: 'Code expired' });
    }

    if (verificationRecord.otp_code !== otp_code) {
      const newAttempts = verificationRecord.failed_attempts + 1;
      
      if (newAttempts >= 3) {
        // Delete the record completely
        await prisma.otpVerification.delete({ where: { id: verificationRecord.id } });
        return res.status(400).json({ error: 'Maximum attempts reached. Please request a new code.' });
      } else {
        // Increment attempts
        await prisma.otpVerification.update({
          where: { id: verificationRecord.id },
          data: { failed_attempts: newAttempts }
        });
        return res.status(400).json({ error: 'Invalid code.' });
      }
    }

    // Code matches
    const user = await prisma.user.update({
      where: { id: verificationRecord.user_id },
      data: { is_phone_verified: true }
    });

    // Delete used OTP record
    await prisma.otpVerification.delete({
      where: { id: verificationRecord.id }
    });

    const access_token = generateAccessToken(user.id, user.role);
    const refresh_token = generateRefreshToken(user.id);

    res.json({
      message: 'Phone verification successful',
      access_token,
      refresh_token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        is_phone_verified: user.is_phone_verified
      }
    });
  } catch (error) {
    console.error('OTP verification error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.login = async (req, res) => {
  const { identifier, password } = req.body;
  if (!identifier || !password) {
    return res.status(400).json({ error: 'Email/phone and password are required' });
  }

  try {
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: identifier },
          { phone_number: identifier }
        ]
      }
    });

    if (!user || !user.password_hash) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isValid = await comparePassword(password, user.password_hash);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const access_token = generateAccessToken(user.id, user.role);
    const refresh_token = generateRefreshToken(user.id);

    res.json({
      message: 'Login successful',
      access_token,
      refresh_token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.refresh = async (req, res) => {
  const { refresh_token } = req.body;
  if (!refresh_token) {
    return res.status(400).json({ error: 'Refresh token is required' });
  }

  try {
    const REFRESH_SECRET = process.env.REFRESH_SECRET || 'refresh_secret';
    const decoded = jwt.verify(refresh_token, REFRESH_SECRET);
    
    // Optional: Check if user still exists in DB or role changed
    const user = await prisma.user.findUnique({ where: { id: decoded.id } });
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    const access_token = generateAccessToken(user.id, user.role);
    
    // Optionally rotate the refresh token
    const new_refresh_token = generateRefreshToken(user.id);

    res.json({
      access_token,
      refresh_token: new_refresh_token
    });
  } catch (error) {
    console.error('Refresh token error:', error);
    return res.status(403).json({ error: 'Invalid or expired refresh token' });
  }
};

exports.resendOtp = async (req, res) => {
  const { phone_number } = req.body;
  
  if (!phone_number) {
    return res.status(400).json({ error: 'Phone number is required' });
  }

  try {
    const user = await prisma.user.findUnique({ where: { phone_number } });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    if (user.is_phone_verified) {
      return res.status(400).json({ error: 'Phone number is already verified' });
    }

    // The 60-Second Cooldown (Business Logic)
    const lastOtp = await prisma.otpVerification.findFirst({
      where: { phone_number },
      orderBy: { created_at: 'desc' }
    });

    if (lastOtp) {
      const timeSinceLastOtp = Date.now() - new Date(lastOtp.created_at).getTime();
      if (timeSinceLastOtp < 60000) {
        return res.status(429).json({ error: 'Please wait 60 seconds before requesting a new OTP.' });
      }
    }

    // Generate new OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    await prisma.otpVerification.create({
      data: {
        user_id: user.id,
        phone_number: user.phone_number,
        otp_code: otpCode,
        expires_at: expiresAt
      }
    });

    // Send SMS
    await smsService.sendOtpSms(user.phone_number, otpCode);

    res.json({ message: 'A new OTP has been sent to your phone number.' });
  } catch (error) {
    console.error('Resend OTP error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.getProfile = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        phone_number: true,
        role: true,
        momo_number: true,
        is_phone_verified: true
      }
    });

    if (!user) return res.status(404).json({ error: 'User not found' });
    res.status(200).json(user);
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, phone_number, momo_number } = req.body;

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(name && { name }),
        ...(phone_number && { phone_number }),
        ...(momo_number !== undefined && { momo_number })
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone_number: true,
        role: true,
        momo_number: true
      }
    });

    res.status(200).json({ message: 'Profile updated successfully', user: updatedUser });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
