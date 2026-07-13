const prisma = require('../prismaClient');

// Get overall platform statistics
exports.getStats = async (req, res) => {
  try {
    const totalUsers = await prisma.user.count();
    const totalProperties = await prisma.property.count();
    const pendingRequests = await prisma.onboardingRequest.count({
      where: { status: 'PENDING' }
    });

    res.json({ totalUsers, totalProperties, pendingRequests });
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get all onboarding requests
exports.getOnboardingRequests = async (req, res) => {
  try {
    const requests = await prisma.onboardingRequest.findMany({
      include: { user: { select: { name: true, email: true, phone_number: true } } },
      orderBy: { createdAt: 'desc' }
    });
    res.json(requests);
  } catch (error) {
    console.error('Error fetching onboarding requests:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Approve an onboarding request
exports.approveRequest = async (req, res) => {
  try {
    const { id } = req.params;

    const request = await prisma.onboardingRequest.findUnique({ where: { id } });
    if (!request) {
      return res.status(404).json({ error: 'Request not found' });
    }

    if (request.status !== 'PENDING') {
      return res.status(400).json({ error: 'Request is already processed' });
    }

    // Parse admin notes to extract property details
    const notes = request.admin_notes || '';
    const titleMatch = notes.match(/Property Name:\s*(.*)/i);
    const addressMatch = notes.match(/Address:\s*(.*)/i);
    const priceMatch = notes.match(/Base Price:\s*(.*)/i);

    const title = titleMatch ? titleMatch[1].trim() : 'New Property';
    const address = addressMatch ? addressMatch[1].trim() : '';
    const base_price = priceMatch && !isNaN(parseFloat(priceMatch[1])) ? parseFloat(priceMatch[1]) : 0;

    const is_multi_room = request.property_type === 'HOTEL' || request.property_type === 'GUESTHOUSE';

    // Execute approval in a transaction
    await prisma.$transaction([
      prisma.onboardingRequest.update({
        where: { id },
        data: { status: 'APPROVED' }
      }),
      prisma.user.update({
        where: { id: request.user_id },
        data: { role: request.requested_role }
      }),
      prisma.property.create({
        data: {
          owner_id: request.user_id,
          title,
          address,
          property_type: request.property_type || 'HOTEL',
          is_multi_room,
          base_price,
          status: 'AVAILABLE'
        }
      })
    ]);

    res.json({ message: 'Request approved successfully. Property created and role upgraded.' });
  } catch (error) {
    console.error('Error approving request:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Reject an onboarding request
exports.rejectRequest = async (req, res) => {
  try {
    const { id } = req.params;

    const request = await prisma.onboardingRequest.findUnique({ where: { id } });
    if (!request) {
      return res.status(404).json({ error: 'Request not found' });
    }

    if (request.status !== 'PENDING') {
      return res.status(400).json({ error: 'Request is already processed' });
    }

    await prisma.onboardingRequest.update({
      where: { id },
      data: { status: 'REJECTED' }
    });

    res.json({ message: 'Request rejected successfully' });
  } catch (error) {
    console.error('Error rejecting request:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get all users
exports.getUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: { id: true, name: true, email: true, phone_number: true, role: true, createdAt: true },
      orderBy: { createdAt: 'desc' }
    });
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get all properties
exports.getProperties = async (req, res) => {
  try {
    const properties = await prisma.property.findMany({
      include: {
        owner: { select: { name: true, email: true } },
        _count: { select: { rooms: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(properties);
  } catch (error) {
    console.error('Error fetching properties:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
