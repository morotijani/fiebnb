require('dotenv').config();
const prisma = require('../prismaClient');
const { hashPassword } = require('../utils/hash');

async function migrate() {
  console.log('--- Starting Role & Data Separation ---');
  
  // 1. Ensure APARTMENT_ADMIN user exists
  const defaultPassword = await hashPassword('password123');
  let aptAdmin = await prisma.user.findFirst({
    where: { email: 'apartment@fiebnb.com' }
  });

  if (!aptAdmin) {
    aptAdmin = await prisma.user.create({
      data: {
        name: 'Apartment Admin Efua',
        email: 'apartment@fiebnb.com',
        phone_number: '0540000005',
        password_hash: defaultPassword,
        role: 'APARTMENT_ADMIN',
        is_phone_verified: true
      }
    });
    console.log('Created APARTMENT_ADMIN user:', aptAdmin.email);
  } else {
    await prisma.user.update({
      where: { id: aptAdmin.id },
      data: { role: 'APARTMENT_ADMIN' }
    });
    console.log('Found existing APARTMENT_ADMIN user:', aptAdmin.email);
  }

  // 2. Reassign Legon Court Apartments to aptAdmin
  const legonCourt = await prisma.property.findFirst({
    where: { title: 'Legon Court Apartments' }
  });

  if (legonCourt) {
    await prisma.property.update({
      where: { id: legonCourt.id },
      data: {
        owner_id: aptAdmin.id,
        property_type: 'APARTMENT'
      }
    });
    console.log('Reassigned Legon Court Apartments to Apartment Admin:', aptAdmin.id);
  }

  // 3. Find Homeowner user
  const homeowner = await prisma.user.findFirst({
    where: { email: 'homeowner@fiebnb.com' }
  });

  if (!homeowner) {
    console.error('Homeowner user not found!');
    return;
  }
  console.log('Found Homeowner:', homeowner.email, homeowner.id);

  // Check if target properties already exist
  const existingEastLegon = await prisma.property.findFirst({
    where: { owner_id: homeowner.id, title: 'Furnished 2-Bed, East Legon' }
  });

  if (!existingEastLegon) {
    console.log('Creating Homeowner properties...');
    const today = new Date();

    // Tenant 1: Efua Boateng
    let tenant1 = await prisma.user.findFirst({ where: { phone_number: '0241000001' } });
    if (!tenant1) {
      tenant1 = await prisma.user.create({
        data: {
          name: 'Efua Boateng',
          email: 'efua.boateng@example.com',
          phone_number: '0241000001',
          password_hash: defaultPassword,
          role: 'GUEST',
          is_phone_verified: true
        }
      });
    }

    // Property 1: Furnished 2-Bed, East Legon
    const p1 = await prisma.property.create({
      data: {
        owner_id: homeowner.id,
        title: 'Furnished 2-Bed, East Legon',
        property_type: 'HOMEOWNER',
        address: 'East Legon, Accra',
        digital_address: 'GA-203-8821',
        base_price: 4800,
        bedrooms: 2,
        bathrooms: 2,
        status: 'AVAILABLE',
        amenities: ['Backup Generator', 'Water Reservoir / Polytank', 'Gated Compound', 'Air Conditioning', 'Furnished', 'Parking Space'],
        advance_years: [1, 2],
        images: ['https://picsum.photos/seed/fiebnb-l4/700/500']
      }
    });

    const p1Start = new Date(today);
    p1Start.setMonth(p1Start.getMonth() - 10);
    const p1End = new Date(p1Start);
    p1End.setFullYear(p1End.getFullYear() + 1);

    const lease1 = await prisma.lease.create({
      data: {
        property_id: p1.id,
        tenant_id: tenant1.id,
        tenant_name: tenant1.name,
        start_date: p1Start,
        end_date: p1End,
        rent_amount: 4800,
        duration_months: 12,
        advance_payment: 57600,
        status: 'ACTIVE'
      }
    });

    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    await prisma.tenantPayment.create({
      data: {
        lease_id: lease1.id,
        amount: 4800,
        due_date: startOfMonth,
        paid_date: new Date(today.getFullYear(), today.getMonth(), 2),
        status: 'PAID'
      }
    });

    await prisma.maintenanceTicket.create({
      data: {
        property_id: p1.id,
        reported_by_id: tenant1.id,
        title: 'Leaking kitchen tap',
        description: 'Reported by Efua Boateng · 2 days ago',
        type: 'droplet',
        status: 'URGENT'
      }
    });

    // Tenant 2: Nii Armah
    let tenant2 = await prisma.user.findFirst({ where: { phone_number: '0241000002' } });
    if (!tenant2) {
      tenant2 = await prisma.user.create({
        data: {
          name: 'Nii Armah',
          email: 'nii.armah@example.com',
          phone_number: '0241000002',
          password_hash: defaultPassword,
          role: 'GUEST',
          is_phone_verified: true
        }
      });
    }

    // Property 2: 3-Bed Family House, Spintex
    const p2 = await prisma.property.create({
      data: {
        owner_id: homeowner.id,
        title: '3-Bed Family House, Spintex',
        property_type: 'HOMEOWNER',
        address: 'Spintex, Accra',
        digital_address: 'GA-514-9920',
        base_price: 6200,
        bedrooms: 3,
        bathrooms: 3,
        status: 'AVAILABLE',
        amenities: ['Backup Generator', 'Water Reservoir / Polytank', 'Gated Compound', 'Parking Space', 'Self Compound'],
        advance_years: [1, 2, 3],
        images: ['https://picsum.photos/seed/fiebnb-l8/700/500']
      }
    });

    const p2Start = new Date(today);
    p2Start.setMonth(p2Start.getMonth() - 2);
    const p2End = new Date(p2Start);
    p2End.setFullYear(p2End.getFullYear() + 2);

    const lease2 = await prisma.lease.create({
      data: {
        property_id: p2.id,
        tenant_id: tenant2.id,
        tenant_name: tenant2.name,
        start_date: p2Start,
        end_date: p2End,
        rent_amount: 6200,
        duration_months: 24,
        advance_payment: 148800,
        status: 'ACTIVE'
      }
    });

    const dueDateIn3Days = new Date(today);
    dueDateIn3Days.setDate(dueDateIn3Days.getDate() + 3);
    await prisma.tenantPayment.create({
      data: {
        lease_id: lease2.id,
        amount: 6200,
        due_date: dueDateIn3Days,
        status: 'DUE'
      }
    });

    await prisma.maintenanceTicket.create({
      data: {
        property_id: p2.id,
        reported_by_id: tenant2.id,
        title: 'Generator not starting',
        description: 'Reported by Nii Armah · 4 days ago',
        type: 'zap',
        status: 'IN_PROGRESS'
      }
    });

    // Tenant 3: Grace Amponsah
    let tenant3 = await prisma.user.findFirst({ where: { phone_number: '0241000003' } });
    if (!tenant3) {
      tenant3 = await prisma.user.create({
        data: {
          name: 'Grace Amponsah',
          email: 'grace.amponsah@example.com',
          phone_number: '0241000003',
          password_hash: defaultPassword,
          role: 'GUEST',
          is_phone_verified: true
        }
      });
    }

    // Property 3: Airport City Corporate Studio
    const p3 = await prisma.property.create({
      data: {
        owner_id: homeowner.id,
        title: 'Airport City Corporate Studio',
        property_type: 'HOMEOWNER',
        address: 'Airport City, Accra',
        digital_address: 'GA-019-3382',
        base_price: 3900,
        bedrooms: 1,
        bathrooms: 1,
        status: 'AVAILABLE',
        amenities: ['Air Conditioning', 'Furnished', 'Wifi', 'Security Guard', 'Backup Generator'],
        advance_years: [1, 2],
        images: ['https://picsum.photos/seed/fiebnb-l10/700/500']
      }
    });

    const p3Start = new Date(today);
    p3Start.setMonth(p3Start.getMonth() - 11);
    const p3End = new Date(p3Start);
    p3End.setFullYear(p3End.getFullYear() + 1);

    const lease3 = await prisma.lease.create({
      data: {
        property_id: p3.id,
        tenant_id: tenant3.id,
        tenant_name: tenant3.name,
        start_date: p3Start,
        end_date: p3End,
        rent_amount: 3900,
        duration_months: 12,
        advance_payment: 46800,
        status: 'ACTIVE'
      }
    });

    const overdueDate = new Date(today);
    overdueDate.setDate(overdueDate.getDate() - 5);
    await prisma.tenantPayment.create({
      data: {
        lease_id: lease3.id,
        amount: 3900,
        due_date: overdueDate,
        status: 'OVERDUE'
      }
    });

    await prisma.maintenanceTicket.create({
      data: {
        property_id: p3.id,
        title: 'AC unit servicing due',
        description: 'Airport City · Scheduled maintenance',
        type: 'general',
        status: 'SCHEDULED'
      }
    });

    // Property 4: Trasacco Valley — Room B (Vacant)
    const p4 = await prisma.property.create({
      data: {
        owner_id: homeowner.id,
        title: 'Trasacco Valley — Room B',
        property_type: 'HOMEOWNER',
        address: 'Trasacco Valley, Accra',
        digital_address: 'GA-882-1002',
        base_price: 5400,
        bedrooms: 1,
        bathrooms: 1,
        status: 'AVAILABLE',
        amenities: ['Gated Compound', 'Parking Space', 'Security Guard', 'Water Reservoir / Polytank'],
        advance_years: [1, 2, 3],
        images: ['https://picsum.photos/seed/fiebnb-l12/700/500']
      }
    });

    await prisma.maintenanceTicket.create({
      data: {
        property_id: p4.id,
        title: 'Gate lock replacement',
        description: 'Trasacco Valley · Reported by caretaker',
        type: 'general',
        status: 'IN_PROGRESS'
      }
    });

    console.log('Seeded 4 Homeowner properties, 3 tenants with leases & payments!');
  } else {
    console.log('Homeowner properties already exist.');
  }

  console.log('--- Migration Complete ---');
}

migrate()
  .catch(console.error)
  .finally(() => prisma.$disconnect().then(() => process.exit(0)));
