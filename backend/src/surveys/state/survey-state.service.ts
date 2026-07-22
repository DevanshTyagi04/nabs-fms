import {
  ConflictException,
  Injectable,
  Logger,
  UnprocessableEntityException,
} from '@nestjs/common';
import { Prisma, RequestStatus, SurveyStatus } from '@prisma/client';
import { PrismaService } from '../../prisma';

// Map of allowed SurveyStatus transitions
const ALLOWED_SURVEY_TRANSITIONS: Record<SurveyStatus, SurveyStatus[]> = {
  [SurveyStatus.DRAFT]: [SurveyStatus.SUBMITTED],
  [SurveyStatus.SUBMITTED]: [SurveyStatus.APPROVED, SurveyStatus.REJECTED, SurveyStatus.SUPERSEDED],
  [SurveyStatus.APPROVED]: [SurveyStatus.SUPERSEDED],
  [SurveyStatus.REJECTED]: [SurveyStatus.SUPERSEDED, SurveyStatus.DRAFT],
  [SurveyStatus.SUPERSEDED]: [],
};

@Injectable()
export class SurveyStateService {
  private readonly logger = new Logger(SurveyStateService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Evaluates if a SurveyStatus transition is permitted
   */
  canTransition(fromStatus: SurveyStatus, toStatus: SurveyStatus): boolean {
    const allowed = ALLOWED_SURVEY_TRANSITIONS[fromStatus] || [];
    return allowed.includes(toStatus);
  }

  /**
   * Executes atomic survey status transition with optimistic concurrency check
   */
  async transitionStatus(
    tx: Prisma.TransactionClient,
    params: {
      surveyId: string;
      currentStatus: SurveyStatus;
      targetStatus: SurveyStatus;
      expectedVersion: number;
      actorUserId: string;
      remarks?: string;
    },
  ) {
    const { surveyId, currentStatus, targetStatus, expectedVersion, actorUserId, remarks } = params;

    // 1. Enforce Survey State Machine Rules
    if (!this.canTransition(currentStatus, targetStatus)) {
      throw new UnprocessableEntityException(
        `Invalid survey status transition from [${currentStatus}] to [${targetStatus}]`,
      );
    }

    // 2. Optimistic Concurrency Update
    const updated = await tx.survey.updateMany({
      where: {
        id: surveyId,
        version: expectedVersion,
      },
      data: {
        status: targetStatus,
        ...(targetStatus === SurveyStatus.SUBMITTED && { submittedAt: new Date() }),
        ...(targetStatus === SurveyStatus.APPROVED && { approvedAt: new Date() }),
      },
    });

    if (updated.count === 0) {
      throw new ConflictException(
        'Concurrent modification detected on survey. Please refresh and try again.',
      );
    }

    // 3. Update related ServiceRequest status cleanly via loose coupling
    const survey = await tx.survey.findUnique({
      where: { id: surveyId },
      select: { serviceRequestId: true },
    });

    if (survey && targetStatus === SurveyStatus.SUBMITTED) {
      await tx.serviceRequest.updateMany({
        where: { id: survey.serviceRequestId },
        data: { status: RequestStatus.SURVEY_SUBMITTED },
      });
      await tx.serviceRequestHistory.create({
        data: {
          serviceRequestId: survey.serviceRequestId,
          fromStatus: RequestStatus.ASSIGNED,
          toStatus: RequestStatus.SURVEY_SUBMITTED,
          changedById: actorUserId,
          remarks: remarks || 'Survey technical inspection submitted by vendor',
        },
      });
    } else if (survey && targetStatus === SurveyStatus.APPROVED) {
      await tx.serviceRequest.updateMany({
        where: { id: survey.serviceRequestId },
        data: { status: RequestStatus.SURVEY_APPROVED },
      });
      await tx.serviceRequestHistory.create({
        data: {
          serviceRequestId: survey.serviceRequestId,
          fromStatus: RequestStatus.SURVEY_SUBMITTED,
          toStatus: RequestStatus.SURVEY_APPROVED,
          changedById: actorUserId,
          remarks: remarks || 'Survey inspection approved by Admin',
        },
      });
    }

    this.logger.log(
      `Survey transition executed: Survey [${surveyId}] [${currentStatus}] -> [${targetStatus}]`,
    );

    return {
      surveyId,
      newStatus: targetStatus,
    };
  }
}
