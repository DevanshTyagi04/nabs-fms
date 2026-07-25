import {
  PrismaClient,
  ServiceCategory,
  SkillLevel,
  User,
  UserRole,
  UserStatus,
  VendorAvailabilityStatus,
  VendorProfile,
  VendorVerificationStatus,
} from '@prisma/client';
import {
  getHashedPassword,
  getRandomDecimal,
  getRandomElement,
  getRandomInt,
  VENDOR_BUSINESSES,
} from './data-generators';

export interface SeededVendor {
  user: User;
  profile: VendorProfile;
}

export async function seedVendors(
  prisma: PrismaClient,
  categories: ServiceCategory[],
  count: number = 30,
): Promise<SeededVendor[]> {
  console.log(`🛠️ Seeding ${count} Development Vendor Accounts & Skills...`);

  const passwordHash = await getHashedPassword();
  const seededVendors: SeededVendor[] = [];

  // Map categories by name for easy lookup
  const categoryMap = new Map<string, ServiceCategory>();
  for (const cat of categories) {
    categoryMap.set(cat.name, cat);
  }

  for (let i = 1; i <= count; i++) {
    const email = `vendor${i}@nabs.com`;
    const phone = `+919840${String(i).padStart(6, '0')}`;
    const vendorTemplate = VENDOR_BUSINESSES[(i - 1) % VENDOR_BUSINESSES.length];

    const gstStateCode = getRandomInt(10, 36);
    const gstNumber = `${gstStateCode}ABCDE${1000 + i}F1Z${i % 9 + 1}`;
    const panNumber = `ABCDE${1000 + i}F`;

    // Edge cases for verification and availability
    let verificationStatus: VendorVerificationStatus = VendorVerificationStatus.VERIFIED;
    let availabilityStatus: VendorAvailabilityStatus = VendorAvailabilityStatus.AVAILABLE;

    if (i === 28) {
      verificationStatus = VendorVerificationStatus.PENDING;
    } else if (i === 29) {
      availabilityStatus = VendorAvailabilityStatus.ON_LEAVE;
    } else if (i === 30) {
      availabilityStatus = VendorAvailabilityStatus.BUSY;
    } else if (i % 7 === 0) {
      availabilityStatus = VendorAvailabilityStatus.BUSY;
    }

    const user = await prisma.user.create({
      data: {
        email,
        phone,
        passwordHash,
        role: UserRole.VENDOR,
        status: UserStatus.ACTIVE,
        emailVerifiedAt: new Date('2025-08-01T00:00:00Z'),
        phoneVerifiedAt: new Date('2025-08-01T00:00:00Z'),
        lastLogin: new Date('2026-07-24T15:00:00Z'),
      },
    });

    const profile = await prisma.vendorProfile.create({
      data: {
        userId: user.id,
        businessName: vendorTemplate.name,
        companyName: `${vendorTemplate.name} Pvt. Ltd.`,
        gstNumber,
        panNumber,
        secondaryPhone: `+919841${String(i).padStart(6, '0')}`,
        yearsExperience: getRandomInt(3, 20),
        bio: `Leading provider of ${vendorTemplate.categories.join(', ')} services with certified technicians and 24/7 service warranty.`,
        availabilityStatus,
        averageRating: getRandomDecimal(4.1, 4.95, 2),
        totalCompletedJobs: getRandomInt(12, 140),
        verificationStatus,
      },
    });

    seededVendors.push({ user, profile });

    // Seed Vendor Skills
    const matchedCategoryNames = vendorTemplate.categories;
    let isPrimaryAssigned = false;

    for (const catName of matchedCategoryNames) {
      const category = categoryMap.get(catName);
      if (category) {
        await prisma.vendorSkill.create({
          data: {
            vendorId: profile.id,
            categoryId: category.id,
            yearsOfExperience: getRandomInt(3, 15),
            skillLevel: isPrimaryAssigned ? SkillLevel.INTERMEDIATE : SkillLevel.EXPERT,
            isPrimary: !isPrimaryAssigned,
          },
        });
        isPrimaryAssigned = true;
      }
    }

    // If no specific category matched, assign 1 random category
    if (!isPrimaryAssigned && categories.length > 0) {
      const fallbackCat = getRandomElement(categories);
      await prisma.vendorSkill.create({
        data: {
          vendorId: profile.id,
          categoryId: fallbackCat.id,
          yearsOfExperience: 5,
          skillLevel: SkillLevel.EXPERT,
          isPrimary: true,
        },
      });
    }
  }

  console.log(`✅ ${seededVendors.length} Vendor accounts, profiles, and skills seeded.`);
  return seededVendors;
}
