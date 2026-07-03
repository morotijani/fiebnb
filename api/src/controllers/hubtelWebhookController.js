const prisma = require('../prismaClient');
const { getIo } = require('../socket');

exports.hubtelWebhook = async (req, res) => {
  try {
    const { Data } = req.body;
    
    // Hubtel typically passes ClientReference in the payload (Data.ClientReference)
    const clientReference = Data?.ClientReference;
    const amount = Data?.Amount;
    const transactionId = Data?.TransactionId; // Hubtel's ID
    const responseCode = Data?.ResponseCode; // e.g. 0000 for success
    
    if (!clientReference) {
      return res.status(400).json({ message: 'Missing ClientReference' });
    }

    // 1. Query Prisma for the pending Transaction using the ClientReference
    const transaction = await prisma.transaction.findUnique({
      where: { client_reference: clientReference },
      include: { booking: true }
    });

    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    // 2. Crucial: Ensure this webhook handler is idempotent
    if (transaction.status === 'SUCCESS' || transaction.status === 'FAILED') {
      // If it's already processed, return 200 early to prevent double-crediting
      return res.status(200).json({ message: 'Transaction already processed' });
    }

    // 3. Check if successful charge
    // Assuming Hubtel ResponseCode '0000' means success
    const isSuccess = responseCode === '0000';

    if (isSuccess) {
      // Update Transaction status to 'SUCCESS' and associate Hubtel's ID
      await prisma.transaction.update({
        where: { id: transaction.id },
        data: {
          status: 'SUCCESS',
          hubtel_transaction_id: transactionId,
        }
      });

      // Change the associated Booking status to 'CONFIRMED'
      if (transaction.booking_id) {
        await prisma.booking.update({
          where: { id: transaction.booking_id },
          data: { status: 'CONFIRMED' }
        });

        // 4. Immediately emit the Socket.io event to update real-time availability
        const io = getIo();
        if (io && transaction.booking) {
          io.emit('booking_confirmed', {
            property_id: transaction.booking.property_id,
            room_id: transaction.booking.room_id,
            check_in: transaction.booking.check_in,
            check_out: transaction.booking.check_out,
          });
        }
      }
    } else {
      // Mark as FAILED
      await prisma.transaction.update({
        where: { id: transaction.id },
        data: {
          status: 'FAILED',
          hubtel_transaction_id: transactionId,
        }
      });
    }

    // Hubtel requires a 200 OK response
    res.status(200).json({ message: 'Webhook processed successfully' });
  } catch (error) {
    console.error('Webhook processing error:', error);
    res.status(500).json({ error: 'Internal server error processing webhook' });
  }
};
