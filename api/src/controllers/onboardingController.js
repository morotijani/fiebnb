const prisma = require('../prismaClient');
const { generateAccessToken, generateRefreshToken } = require('../utils/jwt');

exports.upgradeToHomeowner = async (req, res) => {
  const userId = req.user.id;
  const { property_details, id_document } = req.body;

  if (!property_details || !property_details.title || !id_document) {
    return res.status(400).json({ error: 'Property details (including title) and ID document are required' });
  }

  try {
    // Escalate role to HOMEOWNER and create the property in a transaction
    const [updatedUser, property] = await prisma.$transaction([
      prisma.user.update({
        where: { id: userId },
        data: { role: 'HOMEOWNER' }
      }),
      prisma.property.create({
        data: {
          owner_id: userId,
          title: property_details.title,
          description: property_details.description || '',
          address: property_details.address || '',
          city: property_details.city || '',
          state: property_details.state || '',
          country: property_details.country || '',
          is_multi_room: property_details.is_multi_room || false,
          status: 'AVAILABLE'
        }
      })
    ]);

    // Issue a fresh JWT reflecting the new HOMEOWNER role
    const access_token = generateAccessToken(updatedUser.id, updatedUser.role);
    const refresh_token = generateRefreshToken(updatedUser.id);

    res.json({
      message: 'Successfully upgraded to HOMEOWNER',
      access_token,
      refresh_token,
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role
      },
      property
    });
  } catch (error) {
    console.error('Homeowner upgrade error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.requestHotelManagerUpgrade = async (req, res) => {
  const userId = req.user.id;
  const { business_name, registration_number, document_urls } = req.body;

  try {
    // We called the model OnboardingRequest, which serves as the VerificationRequest
    const request = await prisma.onboardingRequest.create({
      data: {
        user_id: userId,
        requested_role: 'HOTEL_MANAGER',
        documents: document_urls,
        admin_notes: `Business Name: ${business_name}\nReg No: ${registration_number}`,
        status: 'PENDING'
      }
    });

    res.json({ message: 'Upgrade request submitted successfully. Awaiting admin verification.', request });
  } catch (error) {
    console.error('Hotel manager upgrade error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.submitOnboarding = async (req, res) => {
  const userId = req.user.id;
  const { title, property_type, address, digital_address, base_price, document_urls } = req.body;

  try {
    const is_multi_room = property_type === 'HOTEL' || property_type === 'GUESTHOUSE';

    if (property_type === 'APARTMENT' || property_type === 'HOMEOWNER') {
      // Instant creation and role upgrade
      const [updatedUser, property] = await prisma.$transaction([
        prisma.user.update({
          where: { id: userId },
          data: { role: 'HOMEOWNER' }
        }),
        prisma.property.create({
          data: {
            owner_id: userId,
            title,
            property_type,
            is_multi_room,
            address: address || '',
            digital_address: digital_address || '',
            base_price: parseFloat(base_price),
            status: 'AVAILABLE'
          }
        })
      ]);

      const access_token = generateAccessToken(updatedUser.id, updatedUser.role);
      const refresh_token = generateRefreshToken(updatedUser.id);

      return res.json({
        message: 'Onboarding completed. You are now a HOMEOWNER.',
        access_token,
        refresh_token,
        user: {
          id: updatedUser.id,
          name: updatedUser.name,
          email: updatedUser.email,
          role: updatedUser.role
        },
        property
      });
    } else {
      // Needs verification for HOTEL or GUESTHOUSE
      const requested_role = property_type === 'HOTEL' ? 'HOTEL_MANAGER' : 'GUEST_HOUSE_ADMIN';
      
      const request = await prisma.onboardingRequest.create({
        data: {
          user_id: userId,
          requested_role,
          property_type,
          documents: document_urls || [],
          admin_notes: `Property Name: ${title}\nAddress: ${address}\nBase Price: ${base_price}`,
          status: 'PENDING'
        }
      });

      return res.json({ 
        message: 'Onboarding request submitted successfully. Awaiting admin verification.', 
        request 
      });
    }
  } catch (error) {
    console.error('Submit onboarding error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
