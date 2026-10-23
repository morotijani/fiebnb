const prisma = require('../prismaClient');
const bcrypt = require('bcrypt');

exports.getMyProperties = async (req, res) => {
  try {
    const userId = req.user.id;
    let properties;

    if (req.user.role === 'ADMIN') {
      properties = await prisma.property.findMany({
        include: {
          rooms: true,
          leases: {
            where: { status: 'ACTIVE' },
            include: { tenant: true }
          }
        },
        orderBy: { createdAt: 'desc' }
      });
    } else {
      properties = await prisma.property.findMany({
        where: {
          OR: [
            { owner_id: userId },
            { staff: { some: { user_id: userId } } }
          ]
        },
        include: {
          rooms: true,
          leases: {
            where: { status: 'ACTIVE' },
            include: { tenant: true }
          }
        },
        orderBy: { createdAt: 'desc' }
      });
    }
    
    res.status(200).json(properties);
  } catch (error) {
    console.error('Error fetching properties:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.getPublicProperties = async (req, res) => {
  try {
    const { type, term, city, search } = req.query;

    const where = {
      status: 'AVAILABLE'
    };

    if (type) {
      where.property_type = type.toUpperCase();
    }

    if (city) {
      where.OR = [
        { address: { contains: city, mode: 'insensitive' } },
        { title: { contains: city, mode: 'insensitive' } }
      ];
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { address: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ];
    }

    const properties = await prisma.property.findMany({
      where,
      include: {
        owner: { select: { id: true, name: true, phone_number: true } },
        rooms: true,
        leases: {
          where: { status: 'ACTIVE' }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.status(200).json(properties);
  } catch (error) {
    console.error('Error fetching public properties:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.getPropertyById = async (req, res) => {
  try {
    const { id } = req.params;
    const property = await prisma.property.findUnique({
      where: { id },
      include: {
        owner: { select: { id: true, name: true, phone_number: true } },
        rooms: true,
        leases: {
          where: { status: 'ACTIVE' },
          include: { tenant: true }
        }
      }
    });

    if (!property) {
      return res.status(404).json({ error: 'Property not found' });
    }

    res.status(200).json(property);
  } catch (error) {
    console.error('Error fetching property by id:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.createProperty = async (req, res) => {
  try {
    const {
      title,
      description,
      base_price,
      property_type,
      address,
      digital_address,
      latitude,
      longitude,
      images,
      bedrooms,
      bathrooms,
      amenities,
      advance_years
    } = req.body;
    const is_multi_room = property_type === 'HOTEL' || property_type === 'GUESTHOUSE';
    const owner_id = req.user.id;

    if (!title || base_price === undefined) {
      return res.status(400).json({ error: 'title and base_price are required' });
    }

    const newProperty = await prisma.property.create({
      data: {
        title,
        ...(description && { description }),
        base_price: parseFloat(base_price),
        property_type: property_type || (req.user.role === 'HOMEOWNER' ? 'HOMEOWNER' : 'HOTEL'),
        is_multi_room,
        owner_id,
        status: 'AVAILABLE',
        ...(address && { address }),
        ...(digital_address && { digital_address }),
        ...(latitude !== undefined && { latitude: parseFloat(latitude) }),
        ...(longitude !== undefined && { longitude: parseFloat(longitude) }),
        images: Array.isArray(images) ? images : [],
        bedrooms: bedrooms !== undefined ? parseInt(bedrooms) : 1,
        bathrooms: bathrooms !== undefined ? parseInt(bathrooms) : 1,
        amenities: Array.isArray(amenities) ? amenities : [],
        advance_years: Array.isArray(advance_years) ? advance_years.map(y => parseInt(y)) : [1, 2]
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
    const {
      title,
      description,
      base_price,
      property_type,
      status,
      address,
      digital_address,
      latitude,
      longitude,
      images,
      bedrooms,
      bathrooms,
      amenities,
      advance_years
    } = req.body;

    if (req.user.role !== 'ADMIN') {
      const existing = await prisma.property.findUnique({ where: { id } });
      if (!existing || existing.owner_id !== req.user.id) {
        return res.status(403).json({ error: 'Unauthorized to modify this property' });
      }
    }

    const updatedProperty = await prisma.property.update({
      where: { id },
      data: {
        ...(title && { title }),
        ...(description !== undefined && { description }),
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
        ...(images !== undefined && { images: Array.isArray(images) ? images : [] }),
        ...(bedrooms !== undefined && { bedrooms: parseInt(bedrooms) }),
        ...(bathrooms !== undefined && { bathrooms: parseInt(bathrooms) }),
        ...(amenities !== undefined && { amenities: Array.isArray(amenities) ? amenities : [] }),
        ...(advance_years !== undefined && { advance_years: Array.isArray(advance_years) ? advance_years.map(y => parseInt(y)) : [1, 2] })
      }
    });

    res.status(200).json({ message: 'Property updated successfully', property: updatedProperty });
  } catch (error) {
    console.error('Error updating property:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.deleteProperty = async (req, res) => {
  try {
    const { id } = req.params;

    if (req.user.role !== 'ADMIN') {
      const existing = await prisma.property.findUnique({ where: { id } });
      if (!existing || existing.owner_id !== req.user.id) {
        return res.status(403).json({ error: 'Unauthorized to delete this property' });
      }
    }

    await prisma.property.delete({
      where: { id }
    });

    res.status(200).json({ message: 'Property deleted successfully' });
  } catch (error) {
    console.error('Error deleting property:', error);
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
