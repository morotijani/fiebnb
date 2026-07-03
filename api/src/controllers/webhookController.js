const prisma = require('../prismaClient');

// Webhook Receiver for MoMo
exports.momoWebhook = async (req, res) => {
  try {
    const { transaction_id, booking_id, amount, status } = req.body;

    // Verify webhook signature here depending on the specific MoMo provider (e.g. Paystack, Hubtel)

    if (status === 'SUCCESS') {
      // Create payment record
      await prisma.payment.create({
        data: {
          booking_id,
          momo_transaction_id: transaction_id,
          amount: parseFloat(amount),
        }
      });

      // Update booking status
      await prisma.booking.update({
        where: { id: booking_id },
        data: { payment_status: 'PAID' }
      });

      return res.status(200).json({ message: 'Webhook received and booking updated' });
    }

    res.status(200).json({ message: 'Webhook received but payment not successful' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error processing webhook' });
  }
};
