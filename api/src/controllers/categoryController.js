const prisma = require('../prismaClient');

// Get categories for logged-in user's properties
exports.getCategories = async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;
    
    const propertyFilter = userRole === 'ADMIN' ? {} : { property: { owner_id: userId } };

    const categories = await prisma.roomCategory.findMany({
      where: propertyFilter,
      orderBy: { name: 'asc' }
    });

    res.status(200).json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Add a new category
exports.addCategory = async (req, res) => {
  try {
    const { property_id, name, price_per_night } = req.body;
    
    // Ensure the property belongs to the user
    if (req.user.role !== 'ADMIN') {
      const property = await prisma.property.findUnique({ where: { id: property_id } });
      if (!property || property.owner_id !== req.user.id) {
        return res.status(403).json({ error: 'Unauthorized to add category to this property' });
      }
    }

    const category = await prisma.roomCategory.create({
      data: {
        property_id,
        name,
        price_per_night: parseFloat(price_per_night)
      }
    });

    res.status(201).json(category);
  } catch (error) {
    console.error('Error adding category:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Update category
exports.updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, price_per_night } = req.body;

    const category = await prisma.roomCategory.update({
      where: { id },
      data: {
        name,
        price_per_night: price_per_night ? parseFloat(price_per_night) : undefined
      }
    });

    res.status(200).json(category);
  } catch (error) {
    console.error('Error updating category:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Delete category
exports.deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if category is in use
    const roomCount = await prisma.room.count({ where: { category_id: id } });
    if (roomCount > 0) {
      return res.status(400).json({ error: 'Cannot delete category that is assigned to rooms. Reassign rooms first.' });
    }

    await prisma.roomCategory.delete({ where: { id } });
    res.status(200).json({ message: 'Category deleted successfully' });
  } catch (error) {
    console.error('Error deleting category:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
