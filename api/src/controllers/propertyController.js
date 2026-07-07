const prisma = require('../prismaClient');

exports.getMyProperties = async (req, res) => {
  try {
    const userId = req.user.id;
    let properties;

    if (req.user.role === 'ADMIN') {
      properties = await prisma.property.findMany();
    } else {
      properties = await prisma.property.findMany({
        where: { owner_id: userId }
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
    const { title, base_price, is_multi_room } = req.body;
    const owner_id = req.user.id;

    if (!title || base_price === undefined) {
      return res.status(400).json({ error: 'title and base_price are required' });
    }

    const newProperty = await prisma.property.create({
      data: {
        title,
        base_price: parseFloat(base_price),
        is_multi_room: is_multi_room || false,
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
    const { title, base_price, status } = req.body;

    const updatedProperty = await prisma.property.update({
      where: { id },
      data: {
        ...(title && { title }),
        ...(base_price !== undefined && { base_price: parseFloat(base_price) }),
        ...(status && { status })
      }
    });

    res.status(200).json({ message: 'Property updated successfully', property: updatedProperty });
  } catch (error) {
    console.error('Error updating property:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
