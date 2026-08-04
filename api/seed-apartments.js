require('dotenv').config();
const prisma = require('./src/prismaClient');

async function main() {
  console.log('Starting seed for apartment features...');

  const owner = await prisma.user.findUnique({
    where: { email: 'abass@email.com' }
  });

  if (!owner) {
    console.log('No HOMEOWNER found. Creating one...');
    // We should just fail gracefully if no user exists
    return;
  }

  let property = await prisma.property.findFirst({
    where: { owner_id: owner.id, property_type: 'APARTMENT' },
    include: { rooms: true }
  });

  if (!property) {
    console.log('No APARTMENT property found. Creating one...');
    property = await prisma.property.create({
      data: {
        owner_id: owner.id,
        title: 'Legon Court Apartments',
        description: 'Luxury apartments in East Legon.',
        property_type: 'APARTMENT',
        address: 'East Legon, Accra',
        base_price: 2000,
      },
      include: { rooms: true }
    });
  }

  if (property.rooms.length < 3) {
      console.log('Adding more rooms to property for realistic seed...');
      let category = await prisma.roomCategory.findFirst({ where: { property_id: property.id }});
      if(!category) {
          category = await prisma.roomCategory.create({
              data: { property_id: property.id, name: 'Apt Unit', price_per_night: property.base_price }
          });
      }
      
      await prisma.room.createMany({
          data: [
              { property_id: property.id, category_id: category.id, room_number: '4B' },
              { property_id: property.id, category_id: category.id, room_number: '2A' },
              { property_id: property.id, category_id: category.id, room_number: '7C' }
          ]
      });
      property = await prisma.property.findUnique({ where: { id: property.id }, include: { rooms: true } });
  }

  const rooms = property.rooms;
  const today = new Date();

  console.log('Creating leases...');
  const lease1 = await prisma.lease.create({
    data: {
      property_id: property.id,
      room_id: rooms[0].id,
      tenant_name: 'Kwesi Adjei',
      start_date: new Date(today.getFullYear(), today.getMonth() - 5, 1),
      end_date: new Date(today.getFullYear(), today.getMonth() + 1, 21),
      rent_amount: 1800,
      status: 'ACTIVE'
    }
  });

  const lease2 = await prisma.lease.create({
    data: {
      property_id: property.id,
      room_id: rooms[1].id,
      tenant_name: 'Linda Owusu',
      start_date: new Date(today.getFullYear() - 1, today.getMonth(), 1),
      end_date: new Date(today.getFullYear(), today.getMonth() + 2, 5),
      rent_amount: 1580,
      status: 'ACTIVE'
    }
  });

  const lease3 = await prisma.lease.create({
    data: {
      property_id: property.id,
      room_id: rooms[2].id,
      tenant_name: 'Michael Tetteh',
      start_date: new Date(today.getFullYear(), today.getMonth() - 2, 1),
      end_date: new Date(today.getFullYear(), today.getMonth() + 2, 19),
      rent_amount: 1950,
      status: 'ACTIVE'
    }
  });

  console.log('Creating tenant payments (rent roll)...');
  await prisma.tenantPayment.createMany({
    data: [
      { lease_id: lease1.id, amount: 1800, due_date: new Date(today.getFullYear(), today.getMonth(), 1), paid_date: new Date(today.getFullYear(), today.getMonth(), 3), status: 'PAID' },
      { lease_id: lease2.id, amount: 1580, due_date: new Date(today.getFullYear(), today.getMonth(), 1), status: 'DUE' },
      { lease_id: lease3.id, amount: 1950, due_date: new Date(today.getFullYear(), today.getMonth(), 1), paid_date: new Date(today.getFullYear(), today.getMonth(), 5), status: 'PAID' },
    ]
  });

  console.log('Creating maintenance tickets...');
  await prisma.maintenanceTicket.createMany({
    data: [
      { property_id: property.id, room_id: rooms[1].id, title: 'Water pump failure', type: 'droplet', status: 'URGENT' },
      { property_id: property.id, room_id: rooms[0].id, title: 'Corridor lighting out', type: 'zap', status: 'IN_PROGRESS' },
      { property_id: property.id, room_id: rooms[2].id, title: 'Repaint vacant unit', type: 'paint-roller', status: 'SCHEDULED' }
    ]
  });

  console.log('Seed completed successfully!');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
