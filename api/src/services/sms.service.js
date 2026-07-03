const axios = require('axios');

class SmsService {
  /**
   * Sends an OTP SMS via Hubtel
   * @param {string} phoneNumber 
   * @param {string} otpCode 
   */
  async sendOtpSms(phoneNumber, otpCode) {
    const message = `Your verification code is ${otpCode}. It expires in 5 minutes. Do not share this with anyone.`;
    
    const clientId = process.env.HUBTEL_CLIENT_ID;
    const clientSecret = process.env.HUBTEL_CLIENT_SECRET;
    const senderId = process.env.HUBTEL_SENDER_ID || 'FIEBNB';
    const hubtelEndpoint = process.env.HUBTEL_SMS_ENDPOINT || 'https://smsc.hubtel.com/v1/messages/send';

    try {
      if (!clientId || !clientSecret || clientId === 'your_hubtel_client_id') {
        console.log('\n======================================================');
        console.log('                 MOCK SMS (DEV MODE)                  ');
        console.log('======================================================');
        console.log(` To:      ${phoneNumber}`);
        console.log(` OTP:     ${otpCode}`);
        console.log(` Message: ${message}`);
        console.log('======================================================\n');
        return { message: 'Mock SMS sent successfully' };
      }

      // Assuming Hubtel SMS API structure
      const response = await axios.post(
        hubtelEndpoint,
        {
          From: senderId,
          To: phoneNumber,
          Content: message,
          RegisteredDelivery: true,
        },
        {
          auth: {
            username: clientId,
            password: clientSecret,
          },
          timeout: 10000, // 10 seconds timeout
        }
      );

      return response.data;
    } catch (error) {
      console.error('Hubtel SMS Service Error:', error.message);
      
      if (error.code === 'ECONNABORTED') {
        throw new Error('SMS provider timed out while sending the message.');
      }
      
      throw new Error('Failed to send OTP SMS. Please try again later.');
    }
  }
}

module.exports = new SmsService();
