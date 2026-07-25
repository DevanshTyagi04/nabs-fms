import { AdminProfile, PrismaClient, User, UserRole, UserStatus } from '@prisma/client';
import { getHashedPassword } from './data-generators';

export interface SeededAdmin {
  user: User;
  profile: AdminProfile;
}

export async function seedAdmins(prisma: PrismaClient): Promise<SeededAdmin[]> {
  console.log('👤 Seeding Development Admin Accounts (3 Admins)...');

  const passwordHash = await getHashedPassword();

  const adminsData = [
    {
      email: 'admin@nabs.com',
      phone: '+919820000001',
      department: 'Platform Operations & Super Admin',
      permissions: ['SUPER_ADMIN', 'MANAGE_USERS', 'MANAGE_VENDORS', 'MANAGE_REQUESTS', 'FINANCIAL_AUDIT'],
      firstName: 'Rajesh',
      lastName: 'Varma',
    },
    {
      email: 'operations@nabs.com',
      phone: '+919820000002',
      department: 'Field Operations & Vendor Dispatch',
      permissions: ['MANAGE_VENDORS', 'MANAGE_REQUESTS', 'DISPATCH_WORK'],
      firstName: 'Anita',
      lastName: 'Desai',
    },
    {
      email: 'finance@nabs.com',
      phone: '+919820000003',
      department: 'Financial Audit & Billing',
      permissions: ['FINANCIAL_AUDIT', 'APPROVE_PAYMENTS', 'GENERATE_INVOICES'],
      firstName: 'Siddharth',
      lastName: 'Mehta',
    },
  ];

  const seededAdmins: SeededAdmin[] = [];

  for (const adminData of adminsData) {
    const user = await prisma.user.create({
      data: {
        email: adminData.email,
        phone: adminData.phone,
        passwordHash,
        role: UserRole.ADMIN,
        status: UserStatus.ACTIVE,
        emailVerifiedAt: new Date('2025-08-01T00:00:00Z'),
        phoneVerifiedAt: new Date('2025-08-01T00:00:00Z'),
        lastLogin: new Date('2026-07-25T10:00:00Z'),
      },
    });

    const profile = await prisma.adminProfile.create({
      data: {
        userId: user.id,
        department: adminData.department,
        permissions: adminData.permissions,
      },
    });

    seededAdmins.push({ user, profile });
  }

  console.log(`✅ ${seededAdmins.length} Admin accounts seeded successfully.`);
  return seededAdmins;
}
