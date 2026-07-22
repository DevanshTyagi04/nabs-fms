import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { SurveyStatus, UserRole } from '@prisma/client';
import { PrismaService } from '../../prisma';
import { IStorageProvider, STORAGE_PROVIDER_TOKEN } from '../../storage';

const ALLOWED_SURVEY_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'application/pdf',
];
const MAX_SURVEY_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

@Injectable()
export class SurveyAttachmentService {
  private readonly logger = new Logger(SurveyAttachmentService.name);

  constructor(
    private readonly prisma: PrismaService,
    @Inject(STORAGE_PROVIDER_TOKEN)
    private readonly storageProvider: IStorageProvider,
  ) {}

  /**
   * Uploads an inspection photo or document linked to a Survey or SurveyItem
   */
  async uploadAttachment(
    userId: string,
    role: UserRole,
    surveyId: string,
    fileBuffer: Buffer,
    originalName: string,
    mimeType: string,
    surveyItemId?: string,
  ) {
    // 1. Validate File Constraints
    if (!ALLOWED_SURVEY_MIME_TYPES.includes(mimeType.toLowerCase())) {
      throw new BadRequestException(
        `Invalid file type. Allowed formats: ${ALLOWED_SURVEY_MIME_TYPES.join(', ')}`,
      );
    }

    if (fileBuffer.length > MAX_SURVEY_FILE_SIZE) {
      throw new BadRequestException('File size exceeds maximum permitted limit of 10MB');
    }

    // 2. Fetch Survey & Validate Ownership & Editable Status
    const survey = await this.prisma.survey.findUnique({
      where: { id: surveyId },
      select: { id: true, vendorId: true, status: true },
    });

    if (!survey) {
      throw new NotFoundException('Survey not found');
    }

    if (role === UserRole.VENDOR) {
      const vendor = await this.prisma.vendorProfile.findFirst({ where: { userId } });
      if (!vendor || survey.vendorId !== vendor.id) {
        throw new ForbiddenException('You do not have permission to attach files to this survey');
      }
      if (survey.status !== SurveyStatus.DRAFT) {
        throw new BadRequestException(`Cannot add attachments to survey in status ${survey.status}`);
      }
    }

    // 3. Verify SurveyItem if provided
    if (surveyItemId) {
      const item = await this.prisma.surveyItem.findFirst({
        where: { id: surveyItemId, surveyId },
      });
      if (!item) {
        throw new NotFoundException('Survey item not found for this survey');
      }
    }

    // 4. Upload File via Storage Provider
    const uploaded = await this.storageProvider.uploadFile(
      fileBuffer,
      originalName,
      mimeType,
      'surveys',
    );

    // 5. Create Attachment Record in DB
    const attachment = await this.prisma.attachment.create({
      data: {
        surveyId,
        surveyItemId: surveyItemId || null,
        uploadedById: userId,
        fileName: uploaded.fileName,
        url: uploaded.url,
        mimeType: uploaded.mimeType,
        fileSize: uploaded.fileSize,
      },
      select: {
        id: true,
        fileName: true,
        url: true,
        mimeType: true,
        fileSize: true,
        uploadedAt: true,
      },
    });

    this.logger.log(
      `[AUDIT_EVENT] [SURVEY_ATTACHMENT_UPLOADED] User: [${userId}] Survey: [${surveyId}] Attachment: [${attachment.id}]`,
    );

    return {
      message: 'Survey photo/document uploaded successfully',
      attachment,
    };
  }

  /**
   * Deletes an attachment linked to a Survey
   */
  async deleteAttachment(
    userId: string,
    role: UserRole,
    surveyId: string,
    attachmentId: string,
  ) {
    const attachment = await this.prisma.attachment.findFirst({
      where: { id: attachmentId, surveyId },
      select: { id: true, url: true, uploadedById: true, survey: { select: { status: true, vendorId: true } } },
    });

    if (!attachment) {
      throw new NotFoundException('Attachment not found for this survey');
    }

    if (role === UserRole.VENDOR) {
      const vendor = await this.prisma.vendorProfile.findFirst({ where: { userId } });
      if (!vendor || attachment.survey?.vendorId !== vendor.id) {
        throw new ForbiddenException('You do not have permission to delete this survey attachment');
      }
      if (attachment.survey?.status !== SurveyStatus.DRAFT) {
        throw new BadRequestException('Cannot remove attachments from a submitted or reviewed survey');
      }
    } else if (role !== UserRole.ADMIN && attachment.uploadedById !== userId) {
      throw new ForbiddenException('You can only remove attachments uploaded by yourself');
    }

    await this.storageProvider.deleteFile(attachment.url);
    await this.prisma.attachment.delete({ where: { id: attachmentId } });

    this.logger.log(
      `[AUDIT_EVENT] [SURVEY_ATTACHMENT_DELETED] User: [${userId}] Survey: [${surveyId}] Attachment: [${attachmentId}]`,
    );

    return {
      message: 'Survey attachment deleted successfully',
    };
  }
}
