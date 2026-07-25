import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';

import { seedClean } from './seed/clean.seed';
import { seedCategories } from './seed/categories.seed';
import { seedAdmins } from './seed/users.seed';
import { seedCustomers } from './seed/customers.seed';
import { seedVendors } from './seed/vendors.seed';
import { seedAddresses } from './seed/addresses.seed';
import { seedAMCSubscriptions } from './seed/amc.seed';
import { seedServiceRequests } from './seed/service-requests.seed';
import { seedSurveys } from './seed/surveys.seed';
import { seedEstimates } from './seed/estimates.seed';
import { seedWorkOrders } from './seed/work-orders.seed';
import { seedPayments } from './seed/payments.seed';
import { seedInvoices } from './seed/invoices.seed';
import { seedNotifications } from './seed/notifications.seed';
import { seedAuditCommentsAttachments } from './seed/audit.seed';

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error('DATABASE_URL environment variable is not defined.');
}

const pool = new pg.Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const startTime = Date.now();
  console.log('🌱 Starting Comprehensive NABS Development Database Seed...');
  console.log('------------------------------------------------------------');

  // 1. Wipe database cleanly
  await seedClean(prisma);

  // 2. Master Categories
  const categories = await seedCategories(prisma);

  // 3. Admin Accounts
  const admins = await seedAdmins(prisma);

  // 4. Customer Accounts
  const customers = await seedCustomers(prisma, 75);

  // 5. Vendor Accounts & Skills
  const vendors = await seedVendors(prisma, categories, 30);

  // 6. Customer Addresses
  const addresses = await seedAddresses(prisma, customers, 120);

  // 7. AMC Subscriptions
  const amcSubscriptions = await seedAMCSubscriptions(prisma, customers, 25);

  // 8. Service Requests
  const serviceRequests = await seedServiceRequests(
    prisma,
    categories,
    customers,
    vendors,
    addresses,
    amcSubscriptions,
    admins,
    300,
  );

  // 9. Technical Surveys
  const surveys = await seedSurveys(prisma, serviceRequests, 200);

  // 10. Financial Estimates
  const estimates = await seedEstimates(prisma, serviceRequests, surveys, 150);

  // 11. Work Orders & Execution Sub-entities
  const workOrders = await seedWorkOrders(prisma, serviceRequests, estimates, admins, 120);

  // 12. Payments
  const payments = await seedPayments(prisma, serviceRequests, 100);

  // 13. Invoices
  const invoices = await seedInvoices(prisma, payments, 100);

  // 14. Notifications
  await seedNotifications(prisma, admins, customers, vendors, 200);

  // 15. Audit Logs, Comments & Attachments
  const { auditLogsCount, commentsCount, attachmentsCount } = await seedAuditCommentsAttachments(
    prisma,
    admins,
    customers,
    vendors,
    serviceRequests,
    surveys,
    estimates,
    workOrders,
    payments,
  );

  const durationMs = Date.now() - startTime;
  const durationSec = (durationMs / 1000).toFixed(2);

  console.log('------------------------------------------------------------');
  console.log(`🎉 NABS Comprehensive Database Seeding Completed in ${durationSec}s!`);
  console.log('📊 RECORD SUMMARY:');
  console.log(`   - Categories         : ${categories.length}`);
  console.log(`   - Admins             : ${admins.length}`);
  console.log(`   - Customers          : ${customers.length}`);
  console.log(`   - Vendors            : ${vendors.length}`);
  console.log(`   - Addresses          : ${addresses.length}`);
  console.log(`   - AMC Subscriptions  : ${amcSubscriptions.length}`);
  console.log(`   - Service Requests   : ${serviceRequests.length}`);
  console.log(`   - Technical Surveys  : ${surveys.length}`);
  console.log(`   - Estimates          : ${estimates.length}`);
  console.log(`   - Work Orders        : ${workOrders.length}`);
  console.log(`   - Payments           : ${payments.length}`);
  console.log(`   - Invoices           : ${invoices.length}`);
  console.log(`   - Internal Notes     : ${commentsCount}`);
  console.log(`   - Attachments        : ${attachmentsCount}`);
  console.log(`   - Audit Logs         : ${auditLogsCount}`);
  console.log('------------------------------------------------------------');
}

main()
  .catch((e) => {
    console.error('❌ Database Seeding Failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
