require('dotenv').config();
const prisma = require('../src/prismaClient');
const { hashPassword } = require('../src/utils/hash');

async function main() {
  console.log('Clearing old data...');
  // Delete in order to avoid foreign key constraints
  await prisma.transaction.deleteMany({});
  await prisma.dispute.deleteMany({});
  await prisma.booking.deleteMany({});
  await prisma.room.deleteMany({});
  await prisma.property.deleteMany({});
  await prisma.onboardingRequest.deleteMany({});
  await prisma.otpVerification.deleteMany({});
  await prisma.user.deleteMany({});

  console.log('Seeding users...');
  const defaultPassword = await hashPassword('password123');

  const adminUser = await prisma.user.create({
    data: {
      name: 'System Admin',
      email: 'admin@fiebnb.com',
      phone_number: '0540000001',
      password_hash: defaultPassword,
      role: 'ADMIN',
      is_phone_verified: true,
    },
  });

  const hotelManagerUser = await prisma.user.create({
    data: {
      name: 'Hotel Manager Kwame',
      email: 'manager@fiebnb.com',
      phone_number: '0540000002',
      password_hash: defaultPassword,
      role: 'HOTEL_MANAGER',
      is_phone_verified: true,
    },
  });

  const homeownerUser = await prisma.user.create({
    data: {
      name: 'Homeowner Ama',
      email: 'homeowner@fiebnb.com',
      phone_number: '0540000003',
      password_hash: defaultPassword,
      role: 'HOMEOWNER',
      is_phone_verified: true,
    },
  });

  const guestUser = await prisma.user.create({
    data: {
      name: 'Guest Kofi',
      email: 'guest@fiebnb.com',
      phone_number: '0540000004',
      password_hash: defaultPassword,
      role: 'GUEST',
      is_phone_verified: true,
    },
  });

  console.log('Seeding properties and rooms...');

  const hotelProperty = await prisma.property.create({
    data: {
      owner_id: hotelManagerUser.id,
      title: 'Grand Accra Hotel',
      latitude: 5.6037,
      longitude: -0.1870,
      base_price: 500.0,
      is_multi_room: true,
      rooms: {
        create: [
          { room_number: '101', price_per_night: 500.0 },
          { room_number: '102', price_per_night: 550.0 },
          { room_number: '103', price_per_night: 600.0 },
        ]
      }
    },
  });

  const homeProperty = await prisma.property.create({
    data: {
      owner_id: homeownerUser.id,
      title: 'Cozy East Legon Villa',
      latitude: 5.6350,
      longitude: -0.1555,
      base_price: 1200.0,
      is_multi_room: false,
    },
  });

  console.log('Seeding bookings...');
  
  // Future booking for Guest Kofi at the Hotel
  const checkIn1 = new Date();
  checkIn1.setDate(checkIn1.getDate() + 5);
  const checkOut1 = new Date();
  checkOut1.setDate(checkOut1.getDate() + 8);

  await prisma.booking.create({
    data: {
      guest_id: guestUser.id,
      property_id: hotelProperty.id,
      // Need a specific room ID for the hotel booking
      // We can query the first room of the hotel
      check_in: checkIn1,
      check_out: checkOut1,
      total_amount: 1500.0,
      status: 'CONFIRMED',
    }
  });

  console.log('Seed data successfully dumped!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
