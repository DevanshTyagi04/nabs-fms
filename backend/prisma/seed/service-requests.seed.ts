import {
  Address,
  AMCSubscription,
  Priority,
  PrismaClient,
  RequestSource,
  RequestStatus,
  ServiceCategory,
  ServiceRequest,
} from '@prisma/client';
import { SeededAdmin } from './users.seed';
import { SeededCustomer } from './customers.seed';
import { SeededVendor } from './vendors.seed';
import {
  CATEGORY_REQUEST_DESCRIPTIONS,
  getRandomDateBetween,
  getRandomDateInPastDays,
  getRandomElement,
} from './data-generators';

export interface SeededServiceRequest {
  request: ServiceRequest;
  customer: SeededCustomer;
  assignedVendor: SeededVendor | null;
  category: ServiceCategory;
  address: Address;
}

export async function seedServiceRequests(
  prisma: PrismaClient,
  categories: ServiceCategory[],
  customers: SeededCustomer[],
  vendors: SeededVendor[],
  addresses: Address[],
  amcSubscriptions: AMCSubscription[],
  admins: SeededAdmin[],
  targetCount: number = 300,
): Promise<SeededServiceRequest[]> {
  console.log(`🎫 Seeding ${targetCount} Service Requests across 16 lifecycle states...`);

  // Target count breakdown per status
  const statusTargets: { status: RequestStatus; count: number }[] = [
    { status: RequestStatus.CREATED, count: 20 },
    { status: RequestStatus.ASSIGNED, count: 20 },
    { status: RequestStatus.SURVEY_PENDING, count: 15 },
    { status: RequestStatus.SURVEY_SUBMITTED, count: 15 },
    { status: RequestStatus.SURVEY_APPROVED, count: 15 },
    { status: RequestStatus.ESTIMATE_CREATED, count: 15 },
    { status: RequestStatus.AWAITING_APPROVAL, count: 20 },
    { status: RequestStatus.ADVANCE_PENDING, count: 15 },
    { status: RequestStatus.ADVANCE_RECEIVED, count: 15 },
    { status: RequestStatus.SCHEDULED, count: 20 },
    { status: RequestStatus.IN_PROGRESS, count: 25 },
    { status: RequestStatus.WORK_COMPLETED, count: 20 },
    { status: RequestStatus.QUALITY_CHECK, count: 15 },
    { status: RequestStatus.FINAL_PAYMENT_PENDING, count: 20 },
    { status: RequestStatus.COMPLETED, count: 40 },
    { status: RequestStatus.ARCHIVED, count: 5 },
    { status: RequestStatus.CANCELLED, count: 5 },
  ];

  const seededRequests: SeededServiceRequest[] = [];
  let ticketIndex = 1;

  // Map addresses by customerId
  const addressesByCustomer = new Map<string, Address[]>();
  for (const addr of addresses) {
    if (!addressesByCustomer.has(addr.customerId)) {
      addressesByCustomer.set(addr.customerId, []);
    }
    addressesByCustomer.get(addr.customerId)!.push(addr);
  }

  // Map active AMC by customerId
  const amcByCustomer = new Map<string, AMCSubscription>();
  for (const amc of amcSubscriptions) {
    if (amc.status === 'ACTIVE') {
      amcByCustomer.set(amc.customerId, amc);
    }
  }

  const defaultAdmin = admins[0].user;

  for (const target of statusTargets) {
    for (let i = 0; i < target.count; i++) {
      const customer = customers[(ticketIndex - 1) % customers.length];
      const customerAddrs = addressesByCustomer.get(customer.profile.id) || [addresses[0]];
      const address = getRandomElement(customerAddrs);
      const category = categories[(ticketIndex - 1) % categories.length];

      // Assign vendor if request is beyond CREATED status
      const needsVendor = target.status !== RequestStatus.CREATED;
      const assignedVendor = needsVendor ? vendors[(ticketIndex - 1) % vendors.length] : null;

      // Request Source
      const hasAMC = amcByCustomer.get(customer.profile.id);
      const source = hasAMC && ticketIndex % 3 === 0 ? RequestSource.AMC : ticketIndex % 5 === 0 ? RequestSource.WARRANTY : RequestSource.ONE_TIME;
      const amcSubscriptionId = source === RequestSource.AMC && hasAMC ? hasAMC.id : null;

      // Priority distribution (edge cases: high and urgent requests)
      let priority: Priority = Priority.MEDIUM;
      if (ticketIndex % 10 === 0) priority = Priority.URGENT;
      else if (ticketIndex % 4 === 0) priority = Priority.HIGH;
      else if (ticketIndex % 5 === 0) priority = Priority.LOW;

      // Ticket number formatting (SR-2025-0001 to SR-2026-0300)
      const year = ticketIndex <= 150 ? '2025' : '2026';
      const ticketNumber = `SR-${year}-${String(ticketIndex).padStart(4, '0')}`;

      // Date distribution
      const daysBack = Math.max(1, Math.floor(365 - (ticketIndex / 300) * 360));
      const createdAt = getRandomDateInPastDays(daysBack);
      const preferredDate = new Date(createdAt.getTime() + 48 * 60 * 60 * 1000);

      // Category template
      const catTemplate = CATEGORY_REQUEST_DESCRIPTIONS[category.name] || CATEGORY_REQUEST_DESCRIPTIONS['Electrical'];
      const title = getRandomElement(catTemplate.titles);
      const description = getRandomElement(catTemplate.descriptions);

      const request = await prisma.serviceRequest.create({
        data: {
          ticketNumber,
          source,
          customerId: customer.profile.id,
          addressId: address.id,
          serviceCategoryId: category.id,
          amcSubscriptionId,
          assignedVendorId: assignedVendor ? assignedVendor.profile.id : null,
          title,
          description,
          priority,
          status: target.status,
          preferredDate,
          version: target.status === RequestStatus.CREATED ? 1 : 2,
          createdAt,
          updatedAt: new Date(createdAt.getTime() + 2 * 60 * 60 * 1000),
        },
      });

      // Initial history entry: CREATED
      await prisma.serviceRequestHistory.create({
        data: {
          serviceRequestId: request.id,
          fromStatus: null,
          toStatus: RequestStatus.CREATED,
          changedById: customer.user.id,
          remarks: 'Service request submitted by customer.',
          createdAt,
        },
      });

      // Secondary history entry if assigned / progressed
      if (target.status !== RequestStatus.CREATED) {
        await prisma.serviceRequestHistory.create({
          data: {
            serviceRequestId: request.id,
            fromStatus: RequestStatus.CREATED,
            toStatus: target.status,
            changedById: defaultAdmin.id,
            remarks: `Request status updated to ${target.status}${assignedVendor ? ` and assigned to vendor ${assignedVendor.profile.businessName}` : ''}.`,
            createdAt: new Date(createdAt.getTime() + 3600000),
          },
        });
      }

      seededRequests.push({
        request,
        customer,
        assignedVendor,
        category,
        address,
      });

      ticketIndex++;
    }
  }

  console.log(`✅ ${seededRequests.length} Service Requests seeded with full history logs.`);
  return seededRequests;
}
