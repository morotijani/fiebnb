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
