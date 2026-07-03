const axios = require('axios');
const { v4: uuidv4 } = require('uuid');

class HubtelService {
  constructor() {
    this.clientId = process.env.HUBTEL_CLIENT_ID || 'dummy_client_id';
    this.clientSecret = process.env.HUBTEL_CLIENT_SECRET || 'dummy_client_secret';
    
    // Create base64 basic auth string
    const authString = Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64');
    
    // User requested standard base url
    this.client = axios.create({
      baseURL: process.env.HUBTEL_BASE_URL || 'https://rmp.hubtel.com',
      headers: {
        'Authorization': `Basic ${authString}`,
        'Content-Type': 'application/json',
      }
    });

    this.merchantAccountNumber = process.env.HUBTEL_MERCHANT_ACCOUNT || 'HM12345';
    this.primaryCallbackUrl = process.env.WEBHOOK_URL || 'https://my-api-domain.com/api/webhooks/hubtel';
  }

  /**
   * Direct Receive / Collection
   */
  async receiveMoney({ amount, customer_msisdn, channel }) {
    const clientReference = uuidv4();
    
    const payload = {
      CustomerName: 'Guest User', // Optionally pass this in
      CustomerMsisdn: customer_msisdn,
      Channel: channel, // e.g. mtn-gh, vodafone-gh, tigo-gh
      Amount: amount,
      PrimaryCallbackUrl: this.primaryCallbackUrl,
      Description: 'Fiebnb Booking Payment',
      ClientReference: clientReference
    };

    try {
      const response = await this.client.post(`/merchantaccount/merchants/${this.merchantAccountNumber}/receive/mobilemoney`, payload);
      return { success: true, data: response.data, clientReference };
    } catch (error) {
      console.error('Hubtel Receive Error:', error.response?.data || error.message);
      return { success: false, error: error.response?.data || error.message, clientReference };
    }
  }

  /**
   * Disbursement / Host Payout
   */
  async sendMoney({ amount, recipient_msisdn, channel }) {
    const clientReference = uuidv4();

    const payload = {
      CustomerName: 'Fiebnb Host',
      CustomerMsisdn: recipient_msisdn,
      Channel: channel,
      Amount: amount,
      PrimaryCallbackUrl: this.primaryCallbackUrl,
      Description: 'Fiebnb Host Commission Payout',
      ClientReference: clientReference
    };

    try {
      // Hubtel send money endpoint
      const response = await this.client.post(`/merchantaccount/merchants/${this.merchantAccountNumber}/send/mobilemoney`, payload);
      return { success: true, data: response.data, clientReference };
    } catch (error) {
      console.error('Hubtel Send Error:', error.response?.data || error.message);
      return { success: false, error: error.response?.data || error.message, clientReference };
    }
  }
}

module.exports = new HubtelService();
