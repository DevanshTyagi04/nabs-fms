import { CustomerProfile, PrismaClient, User, UserRole, UserStatus } from '@prisma/client';
import {
  CUSTOMER_COMPANIES,
  FIRST_NAMES,
  getHashedPassword,
  getRandomDateInPastDays,
  getRandomElement,
  LAST_NAMES,
} from './data-generators';

export interface SeededCustomer {
  user: User;
  profile: CustomerProfile;
}

export async function seedCustomers(prisma: PrismaClient, count: number = 75): Promise<SeededCustomer[]> {
  console.log(`👥 Seeding ${count} Development Customer Accounts...`);

  const passwordHash = await getHashedPassword();
  const seededCustomers: SeededCustomer[] = [];

  for (let i = 1; i <= count; i++) {
    const email = `customer${i}@nabs.com`;
    const phone = `+919830${String(i).padStart(6, '0')}`;
    const firstName = FIRST_NAMES[(i - 1) % FIRST_NAMES.length];
    const lastName = LAST_NAMES[(i - 1) % LAST_NAMES.length];
    // Give company name to ~40% of customers
    const companyName = i % 2 === 0 ? CUSTOMER_COMPANIES[(i - 1) % CUSTOMER_COMPANIES.length] : null;

    const createdAt = getRandomDateInPastDays(365);

    const user = await prisma.user.create({
      data: {
        email,
        phone,
        passwordHash,
        role: UserRole.CUSTOMER,
        status: UserStatus.ACTIVE,
        emailVerifiedAt: createdAt,
        phoneVerifiedAt: createdAt,
        lastLogin: getRandomDateInPastDays(30),
        createdAt,
      },
    });

    const profile = await prisma.customerProfile.create({
      data: {
        userId: user.id,
        firstName,
        lastName,
        companyName,
        createdAt,
      },
    });

    seededCustomers.push({ user, profile });
  }

  console.log(`✅ ${seededCustomers.length} Customer accounts and profiles seeded.`);
  return seededCustomers;
}
