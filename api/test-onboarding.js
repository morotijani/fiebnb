require('dotenv').config();
const axios = require('axios');
const { v4: uuidv4 } = require('uuid');

async function test() {
  try {
    const phoneNumber = '0' + Math.floor(Math.random() * 1000000000).toString().padStart(9, '0');
    console.log('Registering user with phone:', phoneNumber);
    
    // 1. Register
    const regRes = await axios.post('http://localhost:3000/api/auth/register', {
      name: 'Test User',
      email: `test${uuidv4()}@example.com`,
      password: 'password123',
      phone_number: phoneNumber
    });
    console.log('Registered:', regRes.data);

    // 2. OTP Code
    const prisma = require('./src/prismaClient');
    const otpRec = await prisma.otpVerification.findFirst({
      where: { user_id: regRes.data.user.id },
      orderBy: { created_at: 'desc' }
    });
    console.log('OTP Code:', otpRec.otp_code);

    // 3. Verify OTP
    const verifyRes = await axios.post('http://localhost:3000/api/auth/verify-otp', {
      phone_number: phoneNumber,
      otp_code: otpRec.otp_code
    });
    console.log('Verified. Tokens:', verifyRes.data.access_token);
    
    // 4. Onboarding
    const onboardRes = await axios.post('http://localhost:3000/api/onboarding/submit', {
      title: 'Test Apartment',
      property_type: 'APARTMENT',
      address: '123 Test St',
      digital_address: 'GA-123',
      base_price: 150,
      document_urls: []
    }, {
      headers: { Authorization: `Bearer ${verifyRes.data.access_token}` }
    });
    
    console.log('Onboarding Success:', onboardRes.data);
    process.exit(0);
  } catch (err) {
    console.error('ERROR RESPONSE:', err.response?.data || err.message);
    process.exit(1);
  }
}

test();
