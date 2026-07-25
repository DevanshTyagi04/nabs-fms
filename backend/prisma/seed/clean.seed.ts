import { PrismaClient } from '@prisma/client';

export async function seedClean(prisma: PrismaClient): Promise<void> {
  console.log('🧹 Cleaning existing development database data...');

  // Delete records in reverse dependency order
  await prisma.auditLog.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.attachment.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.invoice.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.workStatusHistory.deleteMany();
  await prisma.workTimeline.deleteMany();
  await prisma.workTask.deleteMany();
  await prisma.workOrder.deleteMany();
  await prisma.estimateItem.deleteMany();
  await prisma.estimate.deleteMany();
  await prisma.surveyItem.deleteMany();
  await prisma.survey.deleteMany();
  await prisma.serviceRequestHistory.deleteMany();
  await prisma.serviceRequest.deleteMany();
  await prisma.vendorSkill.deleteMany();
  await prisma.aMCSubscription.deleteMany();
  await prisma.address.deleteMany();
  await prisma.adminProfile.deleteMany();
  await prisma.vendorProfile.deleteMany();
  await prisma.customerProfile.deleteMany();
  await prisma.refreshToken.deleteMany();
  await prisma.user.deleteMany();
  await prisma.serviceCategory.deleteMany();

  console.log('✅ Development database wiped cleanly.');
}
