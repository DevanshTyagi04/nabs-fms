import {
  PrismaClient,
  TaskStatus,
  WorkOrder,
  WorkOrderStatus,
} from '@prisma/client';
import { SeededAdmin } from './users.seed';
import { SeededEstimate } from './estimates.seed';
import { SeededServiceRequest } from './service-requests.seed';
import { getRandomInt } from './data-generators';

export interface SeededWorkOrder {
  workOrder: WorkOrder;
  serviceRequest: SeededServiceRequest;
}

export async function seedWorkOrders(
  prisma: PrismaClient,
  serviceRequests: SeededServiceRequest[],
  estimates: SeededEstimate[],
  admins: SeededAdmin[],
  targetWorkOrderCount: number = 120,
): Promise<SeededWorkOrder[]> {
  console.log(`🔨 Seeding ${targetWorkOrderCount} Work Orders, Tasks, Timelines & Status History...`);

  // Map estimates by serviceRequestId
  const estimateByReqId = new Map<string, SeededEstimate>();
  for (const e of estimates) {
    estimateByReqId.set(e.serviceRequest.request.id, e);
  }

  // Filter requests at or past SCHEDULED state and having an assigned vendor
  const eligibleRequests = serviceRequests.filter((sr) => {
    const st = sr.request.status;
    return (
      st === 'SCHEDULED' ||
      st === 'IN_PROGRESS' ||
      st === 'WORK_COMPLETED' ||
      st === 'QUALITY_CHECK' ||
      st === 'FINAL_PAYMENT_PENDING' ||
      st === 'COMPLETED' ||
      st === 'ARCHIVED'
    );
  });

  const defaultAdminUser = admins[0].user;
  const seededWorkOrders: SeededWorkOrder[] = [];

  for (let i = 0; i < Math.min(targetWorkOrderCount, eligibleRequests.length); i++) {
    const sr = eligibleRequests[i];
    const linkedEstimate = estimateByReqId.get(sr.request.id);
    const reqStatus = sr.request.status;

    let woStatus: WorkOrderStatus = WorkOrderStatus.COMPLETED;
    let actualStartTime: Date | null = new Date(sr.request.createdAt.getTime() + 86400000);
    let actualEndTime: Date | null = new Date(sr.request.createdAt.getTime() + 172800000);
    let startedAt: Date | null = actualStartTime;
    let completedAt: Date | null = actualEndTime;

    if (reqStatus === 'SCHEDULED') {
      woStatus = WorkOrderStatus.SCHEDULED;
      actualStartTime = null;
      actualEndTime = null;
      startedAt = null;
      completedAt = null;
    } else if (reqStatus === 'IN_PROGRESS') {
      woStatus = WorkOrderStatus.IN_PROGRESS;
      actualEndTime = null;
      completedAt = null;
    } else if (i % 14 === 0) {
      woStatus = WorkOrderStatus.ON_HOLD;
      actualEndTime = null;
      completedAt = null;
    }

    const year = i <= 60 ? '2025' : '2026';
    const workOrderNumber = `WO-${year}-${String(i + 1).padStart(4, '0')}`;
    const scheduledStart = new Date(sr.request.createdAt.getTime() + 86400000);
    const scheduledEnd = new Date(sr.request.createdAt.getTime() + 172800000);

    const workOrder = await prisma.workOrder.create({
      data: {
        workOrderNumber,
        serviceRequestId: sr.request.id,
        estimateId: linkedEstimate ? linkedEstimate.estimate.id : null,
        assignedVendorId: sr.assignedVendor!.profile.id,
        status: woStatus,
        scheduledStart,
        scheduledEnd,
        estimatedDuration: getRandomInt(4, 24),
        actualStartTime,
        actualEndTime,
        startedAt,
        completedAt,
        version: woStatus === WorkOrderStatus.COMPLETED ? 3 : 1,
        createdAt: scheduledStart,
      },
    });

    // Seed 3 Work Tasks per work order
    for (let taskSeq = 1; taskSeq <= 3; taskSeq++) {
      let taskStatus: TaskStatus = TaskStatus.COMPLETED;
      let taskCompletedAt: Date | null = actualEndTime;

      if (woStatus === WorkOrderStatus.SCHEDULED) {
        taskStatus = TaskStatus.PENDING;
        taskCompletedAt = null;
      } else if (woStatus === WorkOrderStatus.IN_PROGRESS && taskSeq === 3) {
        taskStatus = TaskStatus.IN_PROGRESS;
        taskCompletedAt = null;
      }

      const taskDesc = taskSeq === 1 ? 'Site Preparation & Equipment Safety Check' : taskSeq === 2 ? 'Core Component Repairs & Main Work Execution' : 'Quality Testing, Clean-up & Client Sign-off';

      await prisma.workTask.create({
        data: {
          workOrderId: workOrder.id,
          description: taskDesc,
          remarks: 'Executed per standard operating procedures.',
          sequenceNumber: taskSeq,
          estimatedHours: 2.5,
          actualHours: taskStatus === TaskStatus.COMPLETED ? 2.5 : null,
          status: taskStatus,
          completedAt: taskCompletedAt,
        },
      });
    }

    // Seed Work Timeline events
    await prisma.workTimeline.create({
      data: {
        workOrderId: workOrder.id,
        eventTitle: 'Work Order Generated & Assigned',
        eventDescription: `Dispatched to vendor ${sr.assignedVendor!.profile.businessName}`,
        actorId: defaultAdminUser.id,
        timestamp: scheduledStart,
      },
    });

    if (startedAt) {
      await prisma.workTimeline.create({
        data: {
          workOrderId: workOrder.id,
          eventTitle: 'Technicians Arrived On Site',
          eventDescription: 'Work started on location.',
          actorId: sr.assignedVendor!.user.id,
          timestamp: startedAt,
        },
      });
    }

    if (completedAt) {
      await prisma.workTimeline.create({
        data: {
          workOrderId: workOrder.id,
          eventTitle: 'Work Execution Completed',
          eventDescription: 'All tasks completed successfully.',
          actorId: sr.assignedVendor!.user.id,
          timestamp: completedAt,
        },
      });
    }

    // Seed Work Status History
    await prisma.workStatusHistory.create({
      data: {
        workOrderId: workOrder.id,
        fromStatus: null,
        toStatus: WorkOrderStatus.ASSIGNED,
        reason: 'Work order initialized.',
        changedById: defaultAdminUser.id,
        changedAt: scheduledStart,
      },
    });

    if (woStatus !== WorkOrderStatus.ASSIGNED) {
      await prisma.workStatusHistory.create({
        data: {
          workOrderId: workOrder.id,
          fromStatus: WorkOrderStatus.ASSIGNED,
          toStatus: woStatus,
          reason: `Updated work order state to ${woStatus}.`,
          changedById: sr.assignedVendor!.user.id,
          changedAt: startedAt || scheduledStart,
        },
      });
    }

    seededWorkOrders.push({ workOrder, serviceRequest: sr });
  }

  console.log(`✅ ${seededWorkOrders.length} Work Orders and child entities seeded.`);
  return seededWorkOrders;
}
