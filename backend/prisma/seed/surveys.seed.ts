import { PrismaClient, Survey, SurveySeverity, SurveyStatus } from '@prisma/client';
import { SeededServiceRequest } from './service-requests.seed';
import { getRandomElement, getRandomInt } from './data-generators';

export interface SeededSurvey {
  survey: Survey;
  serviceRequest: SeededServiceRequest;
}

export async function seedSurveys(
  prisma: PrismaClient,
  serviceRequests: SeededServiceRequest[],
  targetSurveyCount: number = 200,
): Promise<SeededSurvey[]> {
  console.log(`🔍 Seeding ${targetSurveyCount} Technical Surveys & Survey Items...`);

  // Filter requests that are at or past SURVEY_PENDING state and have an assigned vendor
  const eligibleRequests = serviceRequests.filter(
    (sr) => sr.request.status !== 'CREATED' && sr.assignedVendor !== null,
  );

  const seededSurveys: SeededSurvey[] = [];

  for (let i = 0; i < Math.min(targetSurveyCount, eligibleRequests.length); i++) {
    const sr = eligibleRequests[i];
    const reqStatus = sr.request.status;

    let status: SurveyStatus = SurveyStatus.APPROVED;
    let startedAt: Date | null = new Date(sr.request.createdAt.getTime() + 3600000);
    let submittedAt: Date | null = new Date(sr.request.createdAt.getTime() + 7200000);
    let approvedAt: Date | null = new Date(sr.request.createdAt.getTime() + 10800000);

    if (reqStatus === 'SURVEY_PENDING') {
      status = SurveyStatus.DRAFT;
      submittedAt = null;
      approvedAt = null;
    } else if (reqStatus === 'SURVEY_SUBMITTED') {
      status = SurveyStatus.SUBMITTED;
      approvedAt = null;
    } else if (i % 15 === 0) {
      status = SurveyStatus.REJECTED;
      approvedAt = null;
    }

    const survey = await prisma.survey.create({
      data: {
        serviceRequestId: sr.request.id,
        vendorId: sr.assignedVendor!.profile.id,
        version: 1,
        status,
        notes: `Technical site inspection conducted by ${sr.assignedVendor!.profile.businessName}. Structural & diagnostic assessment detailed below.`,
        startedAt,
        submittedAt,
        approvedAt,
        createdAt: startedAt || sr.request.createdAt,
      },
    });

    // Seed 2-4 Survey Items per survey
    const numItems = getRandomInt(2, 4);
    for (let j = 1; j <= numItems; j++) {
      const area = j === 1 ? 'Primary Site Area / Main Unit' : j === 2 ? 'Adjoining Wall & Piping' : 'Electrical & Circuit Panel';
      const element = j === 1 ? 'Main Compressor / Cable Junction' : 'Drain Pipe / Surface Seal';

      let severity: SurveySeverity = SurveySeverity.MEDIUM;
      if (j === 1 && i % 4 === 0) severity = SurveySeverity.HIGH;
      else if (j === 1 && i % 10 === 0) severity = SurveySeverity.CRITICAL;
      else if (j === 2) severity = SurveySeverity.LOW;

      await prisma.surveyItem.create({
        data: {
          surveyId: survey.id,
          area,
          element,
          observation: `Inspected ${element} in ${area}. Observed wear and potential fault indicators requiring servicing.`,
          actionRequired: `Replace worn components and apply protective insulation coat.`,
          severity,
          sortOrder: j,
          isMandatory: j === 1,
          photoRequired: true,
        },
      });
    }

    seededSurveys.push({ survey, serviceRequest: sr });
  }

  console.log(`✅ ${seededSurveys.length} Technical Surveys and linked items seeded.`);
  return seededSurveys;
}
