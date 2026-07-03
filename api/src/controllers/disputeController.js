const prisma = require('../prismaClient');
const hubtelService = require('../services/hubtelService');

// Guest initiates a dispute
exports.initiateDispute = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { reason_text, evidence_images } = req.body;
    const guest_id = req.user.id;

    // Verify booking belongs to guest
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId }
    });

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    if (booking.guest_id !== guest_id) {
      return res.status(403).json({ error: 'Not authorized to dispute this booking' });
    }

    // Verify current time is within 24 hours of check_in_date
    const checkInTime = new Date(booking.check_in).getTime();
    const currentTime = new Date().getTime();
    const hoursSinceCheckIn = (currentTime - checkInTime) / (1000 * 60 * 60);

    // Allowing negative hours in case they dispute right before checking in, 
    // but strictly enforcing the 24 hour upper bound after check-in.
    if (hoursSinceCheckIn > 24) {
      return res.status(400).json({ error: 'Disputes must be initiated within 24 hours of check-in' });
    }

    // Create Dispute and update BookingStatus
    const [dispute, updatedBooking] = await prisma.$transaction([
      prisma.dispute.create({
        data: {
          booking_id: bookingId,
          reason_text,
          evidence_images: evidence_images || [],
          status: 'OPEN'
        }
      }),
      prisma.booking.update({
        where: { id: bookingId },
        data: { status: 'DISPUTED' }
      })
    ]);

    res.status(201).json({ message: 'Dispute initiated successfully', dispute, booking: updatedBooking });
  } catch (error) {
    console.error('Error initiating dispute:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Admin resolves a dispute
exports.resolveDispute = async (req, res) => {
  try {
    const { id } = req.params;
    const { resolution, admin_notes } = req.body; // resolution: 'GUEST' or 'HOST'

    if (!['GUEST', 'HOST'].includes(resolution)) {
      return res.status(400).json({ error: 'Invalid resolution. Must be GUEST or HOST' });
    }

    // Interactive Transaction to ensure DB updates only happen if Hubtel call (if any) succeeds
    await prisma.$transaction(async (tx) => {
      const dispute = await tx.dispute.findUnique({
        where: { id },
        include: { 
          booking: {
            include: { guest: true, property: { include: { owner: true } } }
          }
        }
      });

      if (!dispute) {
        throw new Error('Dispute not found');
      }

      if (dispute.status !== 'OPEN') {
        throw new Error('Dispute is already resolved');
      }

      if (resolution === 'GUEST') {
        // Resolve in favor of Guest: Refund Guest
        const amount = dispute.booking.total_amount;
        const guestMomo = dispute.booking.guest.momo_number || dispute.booking.guest.phone_number;

        if (!guestMomo) {
          throw new Error('Guest does not have a MoMo number for refund');
        }

        // Call Hubtel to refund
        const hubtelRes = await hubtelService.sendMoney({
          amount: amount,
          recipient_msisdn: guestMomo,
          channel: 'mtn-gh' // In production, derive from the momo number network
        });

        if (!hubtelRes.success) {
          // Throwing an error will automatically rollback the Prisma transaction
          throw new Error(`Hubtel Refund Failed: ${JSON.stringify(hubtelRes.error)}`);
        }

        // Create a transaction record for the refund
        await tx.transaction.create({
          data: {
            booking_id: dispute.booking.id,
            client_reference: hubtelRes.clientReference,
            amount: amount,
            type: 'DISBURSEMENT',
            status: 'PENDING' // Will be updated to SUCCESS by webhook
          }
        });

        // Update Booking and Dispute
        await tx.booking.update({
          where: { id: dispute.booking.id },
          data: { status: 'REFUNDED' }
        });

        await tx.dispute.update({
          where: { id },
          data: { status: 'RESOLVED_GUEST', admin_notes }
        });

      } else if (resolution === 'HOST') {
        // Resolve in favor of Host: Allow payout to proceed via Cron
        await tx.booking.update({
          where: { id: dispute.booking.id },
          data: { status: 'COMPLETED' }
        });

        await tx.dispute.update({
          where: { id },
          data: { status: 'RESOLVED_HOST', admin_notes }
        });
      }
    });

    res.status(200).json({ message: `Dispute resolved in favor of ${resolution}` });
  } catch (error) {
    console.error('Error resolving dispute:', error);
    // Determine if it's a known error we threw or something else
    res.status(400).json({ error: error.message || 'Internal server error' });
  }
};

// Admin gets private evidence URLs
exports.getEvidenceUrls = async (req, res) => {
  try {
    const { id } = req.params;
    const s3StorageService = require('../services/s3StorageService');

    const dispute = await prisma.dispute.findUnique({
      where: { id }
    });

    if (!dispute) {
      return res.status(404).json({ error: 'Dispute not found' });
    }

    if (!dispute.evidence_images || dispute.evidence_images.length === 0) {
      return res.status(200).json({ urls: [] });
    }

    // Generate Presigned GET URLs for each evidence image key
    const urlPromises = dispute.evidence_images.map((objectKey) => 
      s3StorageService.generateReadUrl(objectKey)
    );

    const urls = await Promise.all(urlPromises);

    res.status(200).json({ urls });
  } catch (error) {
    console.error('Error generating evidence URLs:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
