const prisma = require('../prismaClient');

// Get all leases and their related payments for the homeowner
exports.getRentRoll = async (req, res) => {
  try {
    const leases = await prisma.lease.findMany({
      where: {
        property: {
          owner_id: req.user.id
        }
      },
      include: {
        property: true,
        room: true,
        tenant: true,
        payments: {
          orderBy: { due_date: 'asc' }
        }
      },
      orderBy: {
        start_date: 'desc'
      }
    });
    res.status(200).json(leases);
  } catch (error) {
    console.error('Error fetching rent roll:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get payments for a specific lease
exports.getLeasePayments = async (req, res) => {
  try {
    const { lease_id } = req.params;
    
    // Verify ownership
    const lease = await prisma.lease.findUnique({
      where: { id: lease_id },
      include: { property: true }
    });

    if (!lease || lease.property.owner_id !== req.user.id) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const payments = await prisma.tenantPayment.findMany({
      where: { lease_id },
      orderBy: { due_date: 'asc' }
    });

    res.status(200).json(payments);
  } catch (error) {
    console.error('Error fetching lease payments:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Generate payments for a lease
exports.generatePayments = async (req, res) => {
  try {
    const { lease_id } = req.params;
    const { frequency } = req.body; // 'UPFRONT' or 'MONTHLY'

    const lease = await prisma.lease.findUnique({
      where: { id: lease_id },
      include: { property: true, payments: true }
    });

    if (!lease || lease.property.owner_id !== req.user.id) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    if (lease.payments.length > 0) {
      return res.status(400).json({ error: 'Payments have already been generated for this lease' });
    }

    const startDate = new Date(lease.start_date);
    const endDate = new Date(lease.end_date);
    
    // Calculate months difference
    const diffMonths = (endDate.getFullYear() - startDate.getFullYear()) * 12 + (endDate.getMonth() - startDate.getMonth());
    const totalMonths = diffMonths <= 0 ? 1 : diffMonths;

    let paymentsToCreate = [];

    if (frequency === 'UPFRONT') {
      // Create a single payment for the entire duration
      const totalAmount = lease.rent_amount * totalMonths;
      paymentsToCreate.push({
        lease_id: lease.id,
        amount: totalAmount,
        due_date: startDate,
        status: 'DUE'
      });
    } else if (frequency === 'MONTHLY') {
      // Create a payment for each month
      for (let i = 0; i < totalMonths; i++) {
        const dueDate = new Date(startDate);
        dueDate.setMonth(startDate.getMonth() + i);
        
        paymentsToCreate.push({
          lease_id: lease.id,
          amount: lease.rent_amount,
          due_date: dueDate,
          status: 'DUE'
        });
      }
    } else {
      return res.status(400).json({ error: 'Invalid frequency. Must be UPFRONT or MONTHLY' });
    }

    await prisma.tenantPayment.createMany({
      data: paymentsToCreate
    });

    const createdPayments = await prisma.tenantPayment.findMany({
      where: { lease_id },
      orderBy: { due_date: 'asc' }
    });

    res.status(201).json(createdPayments);
  } catch (error) {
    console.error('Error generating payments:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Mark payment as paid
exports.markPaymentPaid = async (req, res) => {
  try {
    const { payment_id } = req.params;
    const { paid_date } = req.body;

    const payment = await prisma.tenantPayment.findUnique({
      where: { id: payment_id },
      include: {
        lease: {
          include: { property: true }
        }
      }
    });

    if (!payment || payment.lease.property.owner_id !== req.user.id) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const updatedPayment = await prisma.tenantPayment.update({
      where: { id: payment_id },
      data: {
        status: 'PAID',
        paid_date: paid_date ? new Date(paid_date) : new Date()
      }
    });

    res.status(200).json(updatedPayment);
  } catch (error) {
    console.error('Error marking payment as paid:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
