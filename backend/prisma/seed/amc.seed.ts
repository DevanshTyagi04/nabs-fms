import { AMCStatus, AMCSubscription, PrismaClient } from '@prisma/client';
import { SeededCustomer } from './customers.seed';
import { getRandomDateInPastDays, getRandomElement, getRandomInt } from './data-generators';

export async function seedAMCSubscriptions(
  prisma: PrismaClient,
  customers: SeededCustomer[],
  count: number = 25,
): Promise<AMCSubscription[]> {
  console.log(`📋 Seeding ${count} AMC Subscriptions...`);

  const planNames = [
    'Platinum Corporate Facility AMC',
    'Gold Commercial HVAC & Electrical AMC',
    'Silver Home Annual Maintenance Package',
    'Enterprise 360 Maintenance Cover',
    'Essential Plumbing & Drainage AMC',
  ];

  const seededAMCs: AMCSubscription[] = [];

  for (let i = 0; i < count; i++) {
    const customer = customers[i % customers.length];
    const planName = getRandomElement(planNames);
    const visitsIncluded = getRandomElement([6, 12, 24]);

    let status: AMCStatus = AMCStatus.ACTIVE;
    let startDate: Date;
    let endDate: Date;
    let visitsUsed: number;

    if (i < 18) {
      // Active AMC
      status = AMCStatus.ACTIVE;
      startDate = getRandomDateInPastDays(180);
      endDate = new Date(startDate.getTime() + 365 * 24 * 60 * 60 * 1000);
      visitsUsed = getRandomInt(1, visitsIncluded - 2);
    } else if (i < 22) {
      // Expired AMC (Edge case)
      status = AMCStatus.EXPIRED;
      startDate = getRandomDateInPastDays(500);
      endDate = getRandomDateInPastDays(30);
      visitsUsed = visitsIncluded;
    } else {
      // Suspended / Cancelled AMC (Edge case)
      status = i % 2 === 0 ? AMCStatus.CANCELLED : AMCStatus.SUSPENDED;
      startDate = getRandomDateInPastDays(300);
      endDate = new Date(startDate.getTime() + 365 * 24 * 60 * 60 * 1000);
      visitsUsed = getRandomInt(0, 3);
    }

    const amc = await prisma.aMCSubscription.create({
      data: {
        customerId: customer.profile.id,
        planName,
        startDate,
        endDate,
        status,
        visitsIncluded,
        visitsUsed,
      },
    });

    seededAMCs.push(amc);
  }

  console.log(`✅ ${seededAMCs.length} AMC Subscriptions seeded.`);
  return seededAMCs;
}
