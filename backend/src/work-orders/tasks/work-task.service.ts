import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, TaskStatus, UserRole, WorkOrderStatus } from '@prisma/client';
import { PrismaService } from '../../prisma';
import { CreateWorkTaskDto, UpdateWorkTaskDto } from '../dto';

@Injectable()
export class WorkTaskService {
  private readonly logger = new Logger(WorkTaskService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Helper: Validates Vendor ownership of WorkOrder
   */
  private async validateVendorOwnership(userId: string, workOrderId: string) {
    const wo = await this.prisma.workOrder.findUnique({
      where: { id: workOrderId },
      select: { id: true, assignedVendorId: true, status: true },
    });

    if (!wo) throw new NotFoundException('Work Order not found');

    const vendor = await this.prisma.vendorProfile.findFirst({ where: { userId } });
    if (!vendor || wo.assignedVendorId !== vendor.id) {
      throw new ForbiddenException('You are not assigned to this Work Order');
    }

    if (wo.status === WorkOrderStatus.COMPLETED || wo.status === WorkOrderStatus.CANCELLED) {
      throw new BadRequestException(`Cannot modify tasks on a Work Order in status ${wo.status}`);
    }

    return wo;
  }

  /**
   * Creates a new execution checklist task for a Work Order
   */
  async createTask(userId: string, role: UserRole, workOrderId: string, dto: CreateWorkTaskDto) {
    if (role === UserRole.VENDOR) {
      await this.validateVendorOwnership(userId, workOrderId);
    }

    const task = await this.prisma.$transaction(async (tx) => {
      const newTask = await tx.workTask.create({
        data: {
          workOrderId,
          description: dto.description.trim(),
          remarks: dto.remarks?.trim() || null,
          sequenceNumber: dto.sequenceNumber || 1,
          estimatedHours: dto.estimatedHours ? new Prisma.Decimal(dto.estimatedHours) : null,
          status: TaskStatus.PENDING,
        },
        select: {
          id: true,
          description: true,
          remarks: true,
          sequenceNumber: true,
          estimatedHours: true,
          status: true,
          createdAt: true,
        },
      });

      await tx.workTimeline.create({
        data: {
          workOrderId,
          eventTitle: 'Work Task Created',
          eventDescription: dto.description.trim(),
          actorId: userId,
        },
      });

      return newTask;
    });

    this.logger.log(`[AUDIT_EVENT] [WORK_TASK_CREATED] User: [${userId}] Task: [${task.id}]`);

    return {
      message: 'Work task created successfully',
      task,
    };
  }

  /**
   * Updates a WorkTask checklist item
   */
  async updateTask(userId: string, role: UserRole, workOrderId: string, taskId: string, dto: UpdateWorkTaskDto) {
    if (role === UserRole.VENDOR) {
      await this.validateVendorOwnership(userId, workOrderId);
    }

    const existingTask = await this.prisma.workTask.findFirst({
      where: { id: taskId, workOrderId },
    });

    if (!existingTask) throw new NotFoundException('Work task not found');

    const isCompleting = dto.status === TaskStatus.COMPLETED && existingTask.status !== TaskStatus.COMPLETED;

    const task = await this.prisma.$transaction(async (tx) => {
      const updated = await tx.workTask.update({
        where: { id: taskId },
        data: {
          ...(dto.description && { description: dto.description.trim() }),
          ...(dto.remarks !== undefined && { remarks: dto.remarks?.trim() || null }),
          ...(dto.status && { status: dto.status }),
          ...(dto.sequenceNumber !== undefined && { sequenceNumber: dto.sequenceNumber }),
          ...(dto.estimatedHours !== undefined && { estimatedHours: new Prisma.Decimal(dto.estimatedHours) }),
          ...(dto.actualHours !== undefined && { actualHours: new Prisma.Decimal(dto.actualHours) }),
          ...(isCompleting && { completedAt: new Date() }),
        },
        select: {
          id: true,
          description: true,
          remarks: true,
          sequenceNumber: true,
          status: true,
          actualHours: true,
          completedAt: true,
          updatedAt: true,
        },
      });

      if (isCompleting) {
        await tx.workTimeline.create({
          data: {
            workOrderId,
            eventTitle: 'Work Task Completed',
            eventDescription: `Task "${updated.description}" marked completed`,
            actorId: userId,
          },
        });
      }

      return updated;
    });

    const auditAction = isCompleting ? 'WORK_TASK_COMPLETED' : 'WORK_TASK_UPDATED';
    this.logger.log(`[AUDIT_EVENT] [${auditAction}] User: [${userId}] Task: [${taskId}]`);

    return {
      message: isCompleting ? 'Work task marked as completed' : 'Work task updated successfully',
      task,
    };
  }

  /**
   * Deletes a WorkTask
   */
  async deleteTask(userId: string, role: UserRole, workOrderId: string, taskId: string) {
    if (role === UserRole.VENDOR) {
      await this.validateVendorOwnership(userId, workOrderId);
    }

    const task = await this.prisma.workTask.findFirst({ where: { id: taskId, workOrderId } });
    if (!task) throw new NotFoundException('Work task not found');

    await this.prisma.workTask.delete({ where: { id: taskId } });

    return { message: 'Work task deleted successfully' };
  }

  /**
   * Lists tasks for a Work Order ordered by sequenceNumber
   */
  async getTasksForWorkOrder(workOrderId: string) {
    return this.prisma.workTask.findMany({
      where: { workOrderId },
      orderBy: { sequenceNumber: 'asc' },
      select: {
        id: true,
        description: true,
        remarks: true,
        sequenceNumber: true,
        estimatedHours: true,
        actualHours: true,
        status: true,
        completedAt: true,
      },
    });
  }
}
