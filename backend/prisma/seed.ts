import 'dotenv/config';
import { PrismaClient, UserRole, UserStatus } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error('DATABASE_URL environment variable is not defined.');
}

const pool = new pg.Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Starting NABS Production Database Seed (Prisma 7)...');

  // ==============================================================================
  // 1. SERVICE CATEGORIES SEEDING
  // ==============================================================================
  console.log('📌 Seeding Master Service Categories...');
  const categories = [
    {
      name: 'Painting',
      description: 'Interior, exterior, texture, and protective wall painting services.',
      icon: 'palette',
      iconUrl: '/assets/icons/painting.png',
      color: '#FF5733',
      displayOrder: 1,
      estimatedDuration: 480, // 8 hours
      isActive: true,
    },
    {
      name: 'Electrical',
      description: 'Wiring, switchboard repair, appliance installation, and safety audits.',
      icon: 'zap',
      iconUrl: '/assets/icons/electrical.png',
      color: '#F1C40F',
      displayOrder: 2,
      estimatedDuration: 120, // 2 hours
      isActive: true,
    },
    {
      name: 'Plumbing',
      description: 'Pipe leakage, fixture installation, drainage clearing, and water heater repair.',
      icon: 'droplet',
      iconUrl: '/assets/icons/plumbing.png',
      color: '#3498DB',
      displayOrder: 3,
      estimatedDuration: 180, // 3 hours
      isActive: true,
    },
    {
      name: 'Civil',
      description: 'Masonry, flooring, tile replacement, plastering, and structural repairs.',
      icon: 'hammer',
      iconUrl: '/assets/icons/civil.png',
      color: '#7F8C8D',
      displayOrder: 4,
      estimatedDuration: 600, // 10 hours
      isActive: true,
    },
    {
      name: 'Waterproofing',
      description: 'Roof, bathroom, terrace, and basement leakage diagnosis and sealing.',
      icon: 'shield',
      iconUrl: '/assets/icons/waterproofing.png',
      color: '#1ABC9C',
      displayOrder: 5,
      estimatedDuration: 360, // 6 hours
      isActive: true,
    },
    {
      name: 'Carpentry',
      description: 'Furniture assembly, door lock repair, cabinet installation, and woodwork.',
      icon: 'tool',
      iconUrl: '/assets/icons/carpentry.png',
      color: '#E67E22',
      displayOrder: 6,
      estimatedDuration: 240, // 4 hours
      isActive: true,
    },
    {
      name: 'Interior',
      description: 'False ceiling, modular kitchen installation, wallpaper, and decor setup.',
      icon: 'layout',
      iconUrl: '/assets/icons/interior.png',
      color: '#9B59B6',
      displayOrder: 7,
      estimatedDuration: 720, // 12 hours
      isActive: true,
    },
    {
      name: 'Cleaning',
      description: 'Deep home cleaning, sofa shampooing, water tank cleaning, and sanitization.',
      icon: 'sparkles',
      iconUrl: '/assets/icons/cleaning.png',
      color: '#2ECC71',
      displayOrder: 8,
      estimatedDuration: 240, // 4 hours
      isActive: true,
    },
  ];

  for (const category of categories) {
    await prisma.serviceCategory.upsert({
      where: { name: category.name },
      update: category,
      create: category,
    });
  }
  console.log(`✅ ${categories.length} Service Categories seeded/updated.`);

  // ==============================================================================
  // 2. DEFAULT ADMIN ACCOUNT SEEDING
  // ==============================================================================
  console.log('👤 Seeding System Default Admin Account...');
  const adminEmail = 'admin@nabs.com';
  const adminPhone = '+18005550199';

  // Hardcoded Argon2id hash for default development password "AdminPass123!"
  const defaultPasswordHash = '$argon2id$v=19$m=65536,t=3,p=4$zE4ipLQdwr4BDwq3v8kHZQ$3gNtK5Q6VVzTOlG8KA8ZwcIsarb7dN0BEquiEn6IRRE';

  const adminUser = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      status: UserStatus.ACTIVE,
      emailVerifiedAt: new Date(),
      phoneVerifiedAt: new Date(),
    },
    create: {
      email: adminEmail,
      phone: adminPhone,
      passwordHash: defaultPasswordHash,
      role: UserRole.ADMIN,
      status: UserStatus.ACTIVE,
      emailVerifiedAt: new Date(),
      phoneVerifiedAt: new Date(),
    },
  });

  await prisma.adminProfile.upsert({
    where: { userId: adminUser.id },
    update: {
      department: 'Platform Operations & Dispatch',
      permissions: ['SUPER_ADMIN', 'MANAGE_VENDORS', 'MANAGE_REQUESTS', 'FINANCIAL_AUDIT'],
    },
    create: {
      userId: adminUser.id,
      department: 'Platform Operations & Dispatch',
      permissions: ['SUPER_ADMIN', 'MANAGE_VENDORS', 'MANAGE_REQUESTS', 'FINANCIAL_AUDIT'],
    },
  });

  console.log(`✅ Default Admin user seeded: ${adminEmail}`);

  console.log('🎉 NABS Database Seeding Completed Successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
