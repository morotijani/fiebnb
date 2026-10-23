const prisma = require('../prismaClient');
const bcrypt = require('bcrypt');

exports.createLease = async (req, res) => {
  try {
    const { 
      property_id, 
      room_id, 
      tenant_name, 
      tenant_email, 
      tenant_phone, 
      start_date, 
      end_date, 
      rent_amount 
    } = req.body;

    // Validate ownership
    const property = await prisma.property.findFirst({
      where: { id: property_id, owner_id: req.user.id }
    });

    if (!property) {
      return res.status(403).json({ error: 'Unauthorized to manage leases for this property' });
    }

    let tenantId = null;

    // Handle tenant user account creation/lookup
    if (tenant_phone) {
      let user = await prisma.user.findUnique({
        where: { phone_number: tenant_phone }
      });

      if (!user) {
        // Create new user with default password
        const defaultPassword = 'Password123!';
        const salt = await bcrypt.genSalt(10);
        const password_hash = await bcrypt.hash(defaultPassword, salt);

        user = await prisma.user.create({
          data: {
            name: tenant_name || 'Unknown Tenant',
            email: tenant_email || null,
            phone_number: tenant_phone,
            password_hash: password_hash,
            role: 'GUEST'
          }
        });
      }
      tenantId = user.id;
    }

    const lease = await prisma.lease.create({
      data: {
        property_id,
        room_id,
        tenant_id: tenantId,
        tenant_name: tenant_name,
        start_date: new Date(start_date),
        end_date: new Date(end_date),
        rent_amount: parseFloat(rent_amount)
      },
      include: {
        room: true,
        property: true,
        tenant: true
      }
    });

    res.status(201).json(lease);
  } catch (error) {
    console.error('Error creating lease:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.updateLease = async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      property_id,
      room_id,
      tenant_name, 
      tenant_phone,
      start_date, 
      end_date, 
      rent_amount,
      status
    } = req.body;

    const existingLease = await prisma.lease.findUnique({
      where: { id },
      include: { property: true }
    });

    if (!existingLease || existingLease.property.owner_id !== req.user.id) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const updatedLease = await prisma.lease.update({
      where: { id },
      data: {
        property_id: property_id || undefined,
        room_id: room_id || undefined,
        tenant_name: tenant_name || undefined,
        start_date: start_date ? new Date(start_date) : undefined,
        end_date: end_date ? new Date(end_date) : undefined,
        rent_amount: rent_amount ? parseFloat(rent_amount) : undefined,
        status: status || undefined
      },
      include: {
        room: true,
        property: true,
        tenant: true
      }
    });

    res.status(200).json(updatedLease);
  } catch (error) {
    console.error('Error updating lease:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.deleteLease = async (req, res) => {
  try {
    const { id } = req.params;

    const existingLease = await prisma.lease.findUnique({
      where: { id },
      include: { property: true }
    });

    if (!existingLease || existingLease.property.owner_id !== req.user.id) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    await prisma.lease.delete({
      where: { id }
    });

    res.status(200).json({ message: 'Lease deleted successfully' });
  } catch (error) {
    console.error('Error deleting lease:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.applyForLease = async (req, res) => {
  try {
    const { property_id, start_date, duration_months = 12, guest_name, guest_phone } = req.body;
    const guestId = req.user.id;

    const property = await prisma.property.findUnique({
      where: { id: property_id },
      include: { owner: true }
    });

    if (!property) {
      return res.status(404).json({ error: 'Property not found' });
    }

    const startDate = new Date(start_date || Date.now());
    const endDate = new Date(startDate);
    const months = parseInt(duration_months) || 12;
    endDate.setMonth(endDate.getMonth() + months);

    const rentAmount = property.base_price;
    const advancePayment = rentAmount * months;

    const lease = await prisma.lease.create({
      data: {
        property_id: property.id,
        tenant_id: guestId,
        tenant_name: guest_name || req.user.name || 'Tenant',
        start_date: startDate,
        end_date: endDate,
        rent_amount: rentAmount,
        duration_months: months,
        advance_payment: advancePayment,
        status: 'PENDING'
      },
      include: {
        property: true,
        tenant: true
      }
    });

    // Create the upfront payment due
    await prisma.tenantPayment.create({
      data: {
        lease_id: lease.id,
        amount: advancePayment,
        due_date: startDate,
        status: 'DUE'
      }
    });

    // Also create booking entry for calendar sync and management queue
    await prisma.booking.create({
      data: {
        guest_id: guestId,
        property_id: property.id,
        check_in: startDate,
        check_out: endDate,
        total_amount: advancePayment,
        booking_source: 'APP',
        status: 'PENDING'
      }
    });

    res.status(201).json({
      message: 'Rental application submitted successfully',
      lease,
      advance_payment: advancePayment,
      monthly_rent: rentAmount,
      duration_months: months
    });
  } catch (error) {
    console.error('Error applying for lease:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
