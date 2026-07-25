import {
  Attachment,
  AuditAction,
  AuditLog,
  Comment,
  PrismaClient,
  StorageProvider,
  User,
} from '@prisma/client';
import { SeededAdmin } from './users.seed';
import { SeededCustomer } from './customers.seed';
import { SeededVendor } from './vendors.seed';
import { SeededServiceRequest } from './service-requests.seed';
import { SeededSurvey } from './surveys.seed';
import { SeededEstimate } from './estimates.seed';
import { SeededWorkOrder } from './work-orders.seed';
import { SeededPayment } from './payments.seed';
import { getRandomDateInPastDays, getRandomElement, getRandomInt } from './data-generators';

export async function seedAuditCommentsAttachments(
  prisma: PrismaClient,
  admins: SeededAdmin[],
  customers: SeededCustomer[],
  vendors: SeededVendor[],
  serviceRequests: SeededServiceRequest[],
  surveys: SeededSurvey[],
  estimates: SeededEstimate[],
  workOrders: SeededWorkOrder[],
  payments: SeededPayment[],
): Promise<{ auditLogsCount: number; commentsCount: number; attachmentsCount: number }> {
  console.log('📑 Seeding Audit Logs (1000+), Internal Notes/Comments (500+), and File Attachments (150+)...');

  const allUsers: User[] = [
    ...admins.map((a) => a.user),
    ...customers.map((c) => c.user),
    ...vendors.map((v) => v.user),
  ];

  const adminUser = admins[0].user;

  // ==============================================================================
  // 1. COMMENTS / INTERNAL NOTES (500+ records)
  // ==============================================================================
  const internalNoteTexts = [
    'Customer confirmed site accessibility between 10 AM and 2 PM tomorrow.',
    'Technician requested additional copper piping fittings before starting work.',
    'Supervisor verified quality check checklist on site. All clear.',
    'Customer requested revised estimate with 5% corporate discount.',
    'Vendor requested advance payment clearance prior to purchasing specialized materials.',
    'Site inspection completed. Moisture reading registered 42% on damp wall section.',
    'Invoice generated and dispatched to customer billing department via email.',
    'Payment received via Razorpay UPI. Gateway reference verified.',
    'Urgent priority request flagged by operations team due to peak heat wave.'
  ];

  let commentsCount = 0;
  for (let i = 0; i < Math.min(300, serviceRequests.length); i++) {
    const sr = serviceRequests[i];
    // Add 1 to 3 comments per request
    const count = i < 100 ? 3 : 1;
    for (let c = 0; c < count; c++) {
      const commenter = c === 0 ? sr.customer.user : c === 1 && sr.assignedVendor ? sr.assignedVendor.user : adminUser;
      const createdAt = new Date(sr.request.createdAt.getTime() + (c + 1) * 3600000);

      await prisma.comment.create({
        data: {
          userId: commenter.id,
          comment: getRandomElement(internalNoteTexts),
          serviceRequestId: sr.request.id,
          createdAt,
        },
      });
      commentsCount++;
    }
  }

  console.log(`  ✅ ${commentsCount} Internal Notes / Comments seeded.`);

  // ==============================================================================
  // 2. ATTACHMENT METADATA (150+ records)
  // ==============================================================================
  const sampleAttachments = [
    { name: 'site_pre_inspection_photo.jpeg', mime: 'image/jpeg', size: 1845000 },
    { name: 'circuit_breaker_diagram.pdf', mime: 'application/pdf', size: 2450000 },
    { name: 'leakage_moisture_thermal_scan.png', mime: 'image/png', size: 3120000 },
    { name: 'material_receipt_invoice.pdf', mime: 'application/pdf', size: 890000 },
    { name: 'completion_signoff_certificate.pdf', mime: 'application/pdf', size: 1250000 },
    { name: 'post_work_quality_photo.jpg', mime: 'image/jpeg', size: 2100000 },
  ];

  let attachmentsCount = 0;
  for (let i = 0; i < Math.min(150, serviceRequests.length); i++) {
    const sr = serviceRequests[i];
    const attSample = sampleAttachments[i % sampleAttachments.length];
    const uploader = sr.assignedVendor ? sr.assignedVendor.user : sr.customer.user;
    const createdAt = new Date(sr.request.createdAt.getTime() + 1800000);

    await prisma.attachment.create({
      data: {
        fileName: attSample.name,
        url: `/uploads/docs/${sr.request.id}_${attSample.name}`,
        mimeType: attSample.mime,
        fileSize: attSample.size,
        storageProvider: StorageProvider.LOCAL,
        checksum: `sha256_mock_${i + 10000}`,
        uploadedById: uploader.id,
        serviceRequestId: sr.request.id,
        uploadedAt: createdAt,
        createdAt,
      },
    });
    attachmentsCount++;
  }

  console.log(`  ✅ ${attachmentsCount} Attachment Metadata records seeded.`);

  // ==============================================================================
  // 3. AUDIT LOGS (1000+ records)
  // ==============================================================================
  let auditLogsCount = 0;
  const auditActions = [AuditAction.CREATE, AuditAction.UPDATE, AuditAction.STATUS_CHANGE, AuditAction.LOGIN, AuditAction.APPROVAL];
  const entityTypes = ['ServiceRequest', 'Survey', 'Estimate', 'WorkOrder', 'Payment', 'Invoice', 'User'];

  for (let i = 0; i < 1050; i++) {
    const performedBy = getRandomElement(allUsers);
    const action = auditActions[i % auditActions.length];
    const entityType = entityTypes[i % entityTypes.length];
    const targetSr = serviceRequests[i % serviceRequests.length];
    const performedAt = getRandomDateInPastDays(360);

    await prisma.auditLog.create({
      data: {
        entityType,
        entityId: targetSr.request.id,
        action,
        oldData: action === AuditAction.STATUS_CHANGE ? { status: 'CREATED', version: 1 } : null,
        newData: action === AuditAction.STATUS_CHANGE ? { status: targetSr.request.status, version: 2 } : { actionExecuted: 'OPERATION_SUCCESS' },
        performedById: performedBy.id,
        performedAt,
      },
    });
    auditLogsCount++;
  }

  console.log(`  ✅ ${auditLogsCount} Audit Log entries seeded.`);

  return { auditLogsCount, commentsCount, attachmentsCount };
}
