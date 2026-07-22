import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { PrismaService } from '../../prisma';
import { IStorageProvider, STORAGE_PROVIDER_TOKEN } from '../../storage';

const ALLOWED_ATTACHMENT_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'application/pdf',
];
const MAX_ATTACHMENT_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB

@Injectable()
export class RequestAttachmentService {
  private readonly logger = new Logger(RequestAttachmentService.name);

  constructor(
    private readonly prisma: PrismaService,
    @Inject(STORAGE_PROVIDER_TOKEN)
    private readonly storageProvider: IStorageProvider,
  ) {}

  /**
   * Uploads & links an attachment file to a ServiceRequest
   */
  async uploadAttachment(
    userId: string,
    role: UserRole,
    requestId: string,
    fileBuffer: Buffer,
    originalName: string,
    mimeType: string,
  ) {
    // 1. Validate File Constraints
    if (!ALLOWED_ATTACHMENT_MIME_TYPES.includes(mimeType.toLowerCase())) {
      throw new BadRequestException(
        `Invalid file format. Allowed formats: ${ALLOWED_ATTACHMENT_MIME_TYPES.join(', ')}`,
      );
    }

    if (fileBuffer.length > MAX_ATTACHMENT_SIZE_BYTES) {
      throw new BadRequestException('Attachment file size exceeds maximum limit of 10MB');
    }

    // 2. Fetch Request & Validate Ownership
    const request = await this.prisma.serviceRequest.findUnique({
      where: { id: requestId },
      select: { id: true, customerId: true, assignedVendorId: true },
    });

    if (!request) {
      throw new NotFoundException('Service request not found');
    }

    if (role === UserRole.CUSTOMER) {
      const customer = await this.prisma.customerProfile.findFirst({ where: { userId } });
      if (!customer || request.customerId !== customer.id) {
        throw new ForbiddenException('You do not have permission to attach files to this request');
      }
    } else if (role === UserRole.VENDOR) {
      const vendor = await this.prisma.vendorProfile.findFirst({ where: { userId } });
      if (!vendor || request.assignedVendorId !== vendor.id) {
        throw new ForbiddenException('You do not have permission to attach files to this request');
      }
    }

    // 3. Upload File via Storage Provider
    const uploaded = await this.storageProvider.uploadFile(
      fileBuffer,
      originalName,
      mimeType,
      'service-requests',
    );

    // 4. Create Attachment Record in DB
    const attachment = await this.prisma.attachment.create({
      data: {
        serviceRequestId: requestId,
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
      `[AUDIT_EVENT] [ATTACHMENT_UPLOADED] User: [${userId}] Request: [${requestId}] Attachment: [${attachment.id}]`,
    );

    return {
      message: 'Attachment uploaded successfully',
      attachment,
    };
  }

  /**
   * Deletes an attachment from a ServiceRequest
   */
  async deleteAttachment(
    userId: string,
    role: UserRole,
    requestId: string,
    attachmentId: string,
  ) {
    const attachment = await this.prisma.attachment.findFirst({
      where: {
        id: attachmentId,
        serviceRequestId: requestId,
      },
    });

    if (!attachment) {
      throw new NotFoundException('Attachment not found for this service request');
    }

    if (role !== UserRole.ADMIN && attachment.uploadedById !== userId) {
      throw new ForbiddenException('You can only remove attachments uploaded by yourself');
    }

    await this.storageProvider.deleteFile(attachment.url);
    await this.prisma.attachment.delete({ where: { id: attachmentId } });

    this.logger.log(
      `[AUDIT_EVENT] [ATTACHMENT_DELETED] User: [${userId}] Request: [${requestId}] Attachment: [${attachmentId}]`,
    );

    return {
      message: 'Attachment deleted successfully',
    };
  }
}
