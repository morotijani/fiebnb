const prisma = require('../prismaClient');
const bcrypt = require('bcrypt');

exports.getMyProperties = async (req, res) => {
  try {
    const userId = req.user.id;
    let properties;

    if (req.user.role === 'ADMIN') {
      properties = await prisma.property.findMany();
    } else {
      properties = await prisma.property.findMany({
        where: {
          OR: [
            { owner_id: userId },
            { staff: { some: { user_id: userId } } }
          ]
        }
      });
    }
    
    res.status(200).json(properties);
  } catch (error) {
    console.error('Error fetching properties:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.createProperty = async (req, res) => {
  try {
    const { title, base_price, property_type } = req.body;
    const is_multi_room = property_type === 'HOTEL' || property_type === 'GUESTHOUSE';
    const owner_id = req.user.id;

    if (!title || base_price === undefined) {
      return res.status(400).json({ error: 'title and base_price are required' });
    }

    const newProperty = await prisma.property.create({
      data: {
        title,
        base_price: parseFloat(base_price),
        property_type: property_type || 'HOTEL',
        is_multi_room,
        owner_id,
        status: 'AVAILABLE'
      }
    });

    res.status(201).json({ message: 'Property created successfully', property: newProperty });
  } catch (error) {
    console.error('Error creating property:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.updateProperty = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, base_price, property_type, status, address, digital_address, latitude, longitude, images } = req.body;

    const updatedProperty = await prisma.property.update({
      where: { id },
      data: {
        ...(title && { title }),
        ...(base_price !== undefined && { base_price: parseFloat(base_price) }),
        ...(property_type !== undefined && { 
          property_type,
          is_multi_room: property_type === 'HOTEL' || property_type === 'GUESTHOUSE'
        }),
        ...(status && { status }),
        ...(address !== undefined && { address }),
        ...(digital_address !== undefined && { digital_address }),
        ...(latitude !== undefined && { latitude: parseFloat(latitude) }),
        ...(longitude !== undefined && { longitude: parseFloat(longitude) }),
        ...(images !== undefined && { images })
      }
    });

    res.status(200).json({ message: 'Property updated successfully', property: updatedProperty });
  } catch (error) {
    console.error('Error updating property:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.getStaff = async (req, res) => {
  try {
    const { id: propertyId } = req.params;
    const staff = await prisma.propertyStaff.findMany({
      where: { property_id: propertyId },
      include: {
        user: {
          select: { id: true, name: true, phone_number: true, role: true }
        }
      }
    });
    res.status(200).json(staff);
  } catch (error) {
    console.error('Error fetching property staff:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.addStaff = async (req, res) => {
  try {
    const { id: propertyId } = req.params;
    const { name, phone_number, role = 'RECEPTIONIST' } = req.body;

    if (!name || !phone_number) {
      return res.status(400).json({ error: 'Name and phone number are required' });
    }

    // Only allow assigning RECEPTIONIST or HOTEL_MANAGER (Admin)
    const validRoles = ['RECEPTIONIST', 'HOTEL_MANAGER'];
    const assignedRole = validRoles.includes(role) ? role : 'RECEPTIONIST';

    // Check if user already exists
    let user = await prisma.user.findUnique({
      where: { phone_number }
    });

    if (!user) {
      // Create new user with default password
      const salt = await bcrypt.genSalt(10);
      const password_hash = await bcrypt.hash('123456', salt);

      user = await prisma.user.create({
        data: {
          name,
          phone_number,
          password_hash,
          role: assignedRole
        }
      });
    } else {
      // Update role if they are being promoted/assigned
      await prisma.user.update({
        where: { id: user.id },
        data: { role: assignedRole }
      });
    }

    // Assign to property
    const propertyStaff = await prisma.propertyStaff.create({
      data: {
        user_id: user.id,
        property_id: propertyId
      }
    });

    res.status(201).json({ message: 'Staff added successfully', propertyStaff });
  } catch (error) {
    // Unique constraint on user_id, property_id
    if (error.code === 'P2002') {
      return res.status(400).json({ error: 'User is already assigned to this property' });
    }
    console.error('Error adding staff:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.removeStaff = async (req, res) => {
  try {
    const { id: propertyId, staffId } = req.params;

    await prisma.propertyStaff.delete({
      where: {
        user_id_property_id: {
          user_id: staffId,
          property_id: propertyId
        }
      }
    });

    res.status(200).json({ message: 'Staff removed successfully' });
  } catch (error) {
    console.error('Error removing staff:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
