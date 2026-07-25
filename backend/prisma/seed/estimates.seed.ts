import { Estimate, EstimateStatus, PrismaClient } from '@prisma/client';
import { SeededServiceRequest } from './service-requests.seed';
import { SeededSurvey } from './surveys.seed';
import { getRandomDecimal, getRandomInt } from './data-generators';

export interface SeededEstimate {
  estimate: Estimate;
  serviceRequest: SeededServiceRequest;
}

export async function seedEstimates(
  prisma: PrismaClient,
  serviceRequests: SeededServiceRequest[],
  surveys: SeededSurvey[],
  targetEstimateCount: number = 150,
): Promise<SeededEstimate[]> {
  console.log(`📊 Seeding ${targetEstimateCount} Financial Estimates & Line Items...`);

  // Map survey by serviceRequestId
  const surveyByReqId = new Map<string, SeededSurvey>();
  for (const s of surveys) {
    surveyByReqId.set(s.serviceRequest.request.id, s);
  }

  // Filter requests that are at or past ESTIMATE_CREATED state
  const eligibleRequests = serviceRequests.filter((sr) => {
    const st = sr.request.status;
    return st !== 'CREATED' && st !== 'ASSIGNED' && st !== 'SURVEY_PENDING' && st !== 'SURVEY_SUBMITTED';
  });

  const seededEstimates: SeededEstimate[] = [];

  for (let i = 0; i < Math.min(targetEstimateCount, eligibleRequests.length); i++) {
    const sr = eligibleRequests[i];
    const reqStatus = sr.request.status;
    const linkedSurvey = surveyByReqId.get(sr.request.id);

    let status: EstimateStatus = EstimateStatus.APPROVED;
    let approvedAt: Date | null = new Date(sr.request.createdAt.getTime() + 14400000);
    let rejectedAt: Date | null = null;

    if (reqStatus === 'ESTIMATE_CREATED') {
      status = EstimateStatus.DRAFT;
      approvedAt = null;
    } else if (reqStatus === 'AWAITING_APPROVAL') {
      status = EstimateStatus.PENDING_APPROVAL;
      approvedAt = null;
    } else if (i % 12 === 0) {
      status = EstimateStatus.REJECTED;
      approvedAt = null;
      rejectedAt = new Date(sr.request.createdAt.getTime() + 14400000);
    }

    // Estimate line items calculation
    const numItems = getRandomInt(2, 4);
    const itemsData: { description: string; quantity: number; unitPrice: number; taxRate: number; discount: number; total: number }[] = [];
    let subtotal = 0;
    let totalTax = 0;
    let totalDiscount = 0;

    for (let j = 1; j <= numItems; j++) {
      const quantity = getRandomInt(1, 10);
      const unitPrice = getRandomInt(500, 7500);
      const taxRate = 18.0; // 18% GST
      const lineSubtotal = quantity * unitPrice;
      const discount = j === 1 && i % 3 === 0 ? 250 : 0;
      const lineTax = ((lineSubtotal - discount) * taxRate) / 100;
      const lineTotal = lineSubtotal - discount + lineTax;

      subtotal += lineSubtotal;
      totalDiscount += discount;
      totalTax += lineTax;

      itemsData.push({
        description: j === 1 ? `Primary Component Labor & Service Charges (${sr.category.name})` : j === 2 ? `Replacement Parts & Hardware Materials` : `Testing, Calibration & Warranty Certificate`,
        quantity,
        unitPrice,
        taxRate,
        discount,
        total: lineTotal,
      });
    }

    const totalAmount = subtotal - totalDiscount + totalTax;
    const validUntil = new Date(sr.request.createdAt.getTime() + 30 * 24 * 60 * 60 * 1000);

    const estimate = await prisma.estimate.create({
      data: {
        serviceRequestId: sr.request.id,
        surveyId: linkedSurvey ? linkedSurvey.survey.id : null,
        version: 1,
        status,
        subtotal: getRandomDecimal(subtotal, subtotal, 2),
        taxAmount: getRandomDecimal(totalTax, totalTax, 2),
        discountAmount: getRandomDecimal(totalDiscount, totalDiscount, 2),
        totalAmount: getRandomDecimal(totalAmount, totalAmount, 2),
        termsAndConditions: '1. Estimate valid for 30 days. 2. 50% advance required upon approval. 3. GST 18% included.',
        validUntil,
        approvedAt,
        rejectedAt,
        createdAt: new Date(sr.request.createdAt.getTime() + 10000000),
      },
    });

    for (const item of itemsData) {
      await prisma.estimateItem.create({
        data: {
          estimateId: estimate.id,
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          taxRate: item.taxRate,
          discount: item.discount,
          total: item.total,
        },
      });
    }

    seededEstimates.push({ estimate, serviceRequest: sr });
  }

  console.log(`✅ ${seededEstimates.length} Estimates and line items seeded.`);
  return seededEstimates;
}
