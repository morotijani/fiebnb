require('dotenv').config();
const prisma = require('./src/prismaClient');

async function main() {
  const properties = await prisma.property.findMany({ include: { rooms: true } });
  
  for (const property of properties) {
    if (property.rooms.length === 0) continue;
    
    // Check if category exists
    let defaultCat = await prisma.roomCategory.findFirst({
      where: { property_id: property.id, name: 'Default Category' }
    });
    
    if (!defaultCat) {
      // Find average price or just use 100
      const defaultPrice = property.rooms[0]?.price_per_night || 100;
      defaultCat = await prisma.roomCategory.create({
        data: {
          property_id: property.id,
          name: 'Default Category',
          price_per_night: defaultPrice
        }
      });
      console.log(`Created Default Category for property ${property.title} with price ₵${defaultPrice}`);
    }
    
    // Update rooms
    await prisma.room.updateMany({
      where: { property_id: property.id, category_id: null },
      data: { category_id: defaultCat.id }
    });
    console.log(`Updated rooms for property ${property.title} to use category ${defaultCat.name}`);
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
