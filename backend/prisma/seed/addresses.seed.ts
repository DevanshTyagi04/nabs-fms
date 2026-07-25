import { Address, AddressType, PrismaClient } from '@prisma/client';
import { SeededCustomer } from './customers.seed';
import { LANDMARKS, getRandomElement, getRandomInt, REALISTIC_CITIES, STREET_TEMPLATES } from './data-generators';

export async function seedAddresses(
  prisma: PrismaClient,
  customers: SeededCustomer[],
  targetCount: number = 120,
): Promise<Address[]> {
  console.log(`📍 Seeding ${targetCount} Customer Addresses...`);

  const seededAddresses: Address[] = [];
  let createdCount = 0;

  for (let idx = 0; idx < customers.length; idx++) {
    const customer = customers[idx];

    // Determine how many addresses for this customer (1, 2, or 3)
    const numAddresses = idx < 25 ? 2 : idx < 40 ? 3 : 1;

    for (let j = 0; j < numAddresses; j++) {
      if (createdCount >= targetCount && idx > 30) break;

      const cityObj = REALISTIC_CITIES[(idx + j) % REALISTIC_CITIES.length];
      const postalCode = getRandomElement(cityObj.postalCodes);
      const streetTemplate = getRandomElement(STREET_TEMPLATES);
      const addressLine1 = streetTemplate
        .replace('{num}', String(getRandomInt(101, 999)))
        .replace('{block}', String.fromCharCode(65 + (j % 5)))
        .replace('{sec}', String(getRandomInt(1, 48)))
        .replace('{building}', getRandomElement(['Lotus', 'Orchid', 'Prestige', 'Empire', 'Royal', 'Silver']));

      const addressType = j === 0 ? AddressType.HOME : j === 1 ? AddressType.OFFICE : AddressType.OTHER;
      const label = j === 0 ? 'Home Address' : j === 1 ? 'Corporate HQ / Office' : 'Warehouse / Secondary Site';

      const address = await prisma.address.create({
        data: {
          customerId: customer.profile.id,
          label,
          addressType,
          addressLine1,
          addressLine2: j > 0 ? `Floor ${j * 2 + 1}, Sector ${getRandomInt(1, 20)}` : null,
          landmark: getRandomElement(LANDMARKS),
          city: cityObj.city,
          state: cityObj.state,
          country: 'India',
          postalCode,
          latitude: 19.0760 + (getRandomInt(-50, 50) / 1000),
          longitude: 72.8777 + (getRandomInt(-50, 50) / 1000),
          isDefault: j === 0,
        },
      });

      seededAddresses.push(address);
      createdCount++;
    }
  }

  console.log(`✅ ${seededAddresses.length} Addresses seeded.`);
  return seededAddresses;
}
