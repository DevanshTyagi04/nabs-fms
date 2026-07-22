import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { UserRole, WorkOrderStatus } from '@prisma/client';
import { PrismaService } from '../../prisma';
import { IStorageProvider, STORAGE_PROVIDER_TOKEN } from '../../storage';

const ALLOWED_WORK_ORDER_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'application/pdf',
];
const MAX_WORK_ORDER_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

@Injectable()
export class WorkOrderAttachmentService {
  private readonly logger = new Logger(WorkOrderAttachmentService.name);

  constructor(
    private readonly prisma: PrismaService,
    @Inject(STORAGE_PROVIDER_TOKEN)
    private readonly storageProvider: IStorageProvider,
  ) {}

  /**
   * Uploads completion photo or document linked to WorkOrder or WorkTask
   */
  async uploadAttachment(
    userId: string,
    role: UserRole,
    workOrderId: string,
    fileBuffer: Buffer,
    originalName: string,
    mimeType: string,
    workTaskId?: string,
  ) {
    if (!ALLOWED_WORK_ORDER_MIME_TYPES.includes(mimeType.toLowerCase())) {
      throw new BadRequestException(
        `Invalid file type. Allowed formats: ${ALLOWED_WORK_ORDER_MIME_TYPES.join(', ')}`,
      );
    }

    if (fileBuffer.length > MAX_WORK_ORDER_FILE_SIZE) {
      throw new BadRequestException('File size exceeds maximum permitted limit of 10MB');
    }

    const wo = await this.prisma.workOrder.findUnique({
      where: { id: workOrderId },
      select: { id: true, assignedVendorId: true, status: true },
    });

    if (!wo) throw new NotFoundException('Work Order not found');

    if (role === UserRole.VENDOR) {
      const vendor = await this.prisma.vendorProfile.findFirst({ where: { userId } });
      if (!vendor || wo.assignedVendorId !== vendor.id) {
        throw new ForbiddenException('You do not have permission to attach files to this Work Order');
      }
      if (wo.status === WorkOrderStatus.CANCELLED) {
        throw new BadRequestException('Cannot add attachments to a cancelled Work Order');
      }
    }

    if (workTaskId) {
      const task = await this.prisma.workTask.findFirst({ where: { id: workTaskId, workOrderId } });
      if (!task) throw new NotFoundException('Work task not found for this Work Order');
    }

    const uploaded = await this.storageProvider.uploadFile(
      fileBuffer,
      originalName,
      mimeType,
      'work-orders',
    );

    const attachment = await this.prisma.$transaction(async (tx) => {
      const att = await tx.attachment.create({
        data: {
          workOrderId,
          workTaskId: workTaskId || null,
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

      await tx.workTimeline.create({
        data: {
          workOrderId,
          eventTitle: 'Completion Attachment Uploaded',
          eventDescription: uploaded.fileName,
          actorId: userId,
        },
      });

      return att;
    });

    this.logger.log(
      `[AUDIT_EVENT] [WORK_ATTACHMENT_UPLOADED] User: [${userId}] WorkOrder: [${workOrderId}] Attachment: [${attachment.id}]`,
    );

    return {
      message: 'Work Order completion file uploaded successfully',
      attachment,
    };
  }

  /**
   * Deletes an attachment linked to a WorkOrder
   */
  async deleteAttachment(
    userId: string,
    role: UserRole,
    workOrderId: string,
    attachmentId: string,
  ) {
    const attachment = await this.prisma.attachment.findFirst({
      where: { id: attachmentId, workOrderId },
      select: { id: true, url: true, uploadedById: true, workOrder: { select: { status: true, assignedVendorId: true } } },
    });

    if (!attachment) throw new NotFoundException('Attachment not found for this Work Order');

    if (role === UserRole.VENDOR) {
      const vendor = await this.prisma.vendorProfile.findFirst({ where: { userId } });
      if (!vendor || attachment.workOrder?.assignedVendorId !== vendor.id) {
        throw new ForbiddenException('You do not have permission to delete this attachment');
      }
      if (attachment.workOrder?.status === WorkOrderStatus.COMPLETED) {
        throw new BadRequestException('Cannot remove attachments from a completed Work Order');
      }
    } else if (role !== UserRole.ADMIN && attachment.uploadedById !== userId) {
      throw new ForbiddenException('You can only remove attachments uploaded by yourself');
    }

    await this.storageProvider.deleteFile(attachment.url);
    await this.prisma.attachment.delete({ where: { id: attachmentId } });

    this.logger.log(
      `[AUDIT_EVENT] [WORK_ATTACHMENT_DELETED] User: [${userId}] WorkOrder: [${workOrderId}] Attachment: [${attachmentId}]`,
    );

    return {
      message: 'Work Order attachment deleted successfully',
    };
  }
}
