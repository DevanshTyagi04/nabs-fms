import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { CurrentUser, Roles } from '../auth/decorators';
import { AuthenticatedUser } from '../auth/interfaces';
import { WorkOrderAttachmentService } from './attachment/work-order-attachment.service';
import {
  AddWorkLogDto,
  CreateWorkTaskDto,
  PauseWorkOrderDto,
  QueryWorkOrderDto,
  UpdateWorkTaskDto,
} from './dto';
import { WorkLogService } from './logs/work-log.service';
import { WorkTaskService } from './tasks/work-task.service';
import { WorkOrdersService } from './work-orders.service';

@ApiTags('Work Orders (Vendor)')
@ApiBearerAuth('JWT-auth')
@Roles(UserRole.VENDOR)
@Controller('vendor/work-orders')
export class VendorWorkOrderController {
  constructor(
    private readonly workOrdersService: WorkOrdersService,
    private readonly taskService: WorkTaskService,
    private readonly logService: WorkLogService,
    private readonly attachmentService: WorkOrderAttachmentService,
  ) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'List Vendor Assigned Work Orders' })
  @ApiResponse({ status: 200, description: 'Assigned Work Orders retrieved successfully.' })
  async getVendorWorkOrders(
    @CurrentUser('id') userId: string,
    @Query() query: QueryWorkOrderDto,
  ) {
    return this.workOrdersService.getVendorWorkOrders(userId, query);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get Assigned Work Order Details' })
  @ApiParam({ name: 'id', description: 'WorkOrder UUID' })
  @ApiResponse({ status: 200, description: 'Work Order execution details returned.' })
  @ApiResponse({ status: 403, description: 'Forbidden: Work Order not assigned to you.' })
  async getVendorWorkOrderById(
    @CurrentUser('id') userId: string,
    @Param('id') workOrderId: string,
  ) {
    return this.workOrdersService.getVendorWorkOrderById(userId, workOrderId);
  }

  @Post(':id/start')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Start Work Order Execution (ASSIGNED/SCHEDULED -> IN_PROGRESS)' })
  @ApiParam({ name: 'id', description: 'WorkOrder UUID' })
  @ApiResponse({ status: 200, description: 'Work started successfully.' })
  async startWork(
    @CurrentUser('id') userId: string,
    @Param('id') workOrderId: string,
  ) {
    return this.workOrdersService.startWorkVendor(userId, workOrderId);
  }

  @Post(':id/pause')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Pause Work Order Execution (IN_PROGRESS -> ON_HOLD)' })
  @ApiParam({ name: 'id', description: 'WorkOrder UUID' })
  @ApiResponse({ status: 200, description: 'Work paused successfully.' })
  async pauseWork(
    @CurrentUser('id') userId: string,
    @Param('id') workOrderId: string,
    @Body() dto: PauseWorkOrderDto,
  ) {
    return this.workOrdersService.pauseWorkVendor(userId, workOrderId, dto);
  }

  @Post(':id/resume')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Resume Paused Work Order Execution (ON_HOLD -> IN_PROGRESS)' })
  @ApiParam({ name: 'id', description: 'WorkOrder UUID' })
  @ApiResponse({ status: 200, description: 'Work resumed successfully.' })
  async resumeWork(
    @CurrentUser('id') userId: string,
    @Param('id') workOrderId: string,
  ) {
    return this.workOrdersService.resumeWorkVendor(userId, workOrderId);
  }

  @Post(':id/complete')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Mark Work Order Completed',
    description:
      'Validates all mandatory tasks are finished and completion photos are uploaded, transitions status to COMPLETED.',
  })
  @ApiParam({ name: 'id', description: 'WorkOrder UUID' })
  @ApiResponse({ status: 200, description: 'Work Order completed successfully.' })
  @ApiResponse({ status: 422, description: 'Completion validation failed (uncompleted tasks or missing photos).' })
  async completeWork(
    @CurrentUser('id') userId: string,
    @Param('id') workOrderId: string,
  ) {
    return this.workOrdersService.completeWorkVendor(userId, workOrderId);
  }

  @Post(':id/tasks')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Add Execution Checklist Task' })
  @ApiParam({ name: 'id', description: 'WorkOrder UUID' })
  @ApiResponse({ status: 201, description: 'Task added successfully.' })
  async createTask(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') workOrderId: string,
    @Body() dto: CreateWorkTaskDto,
  ) {
    return this.taskService.createTask(user.id, user.role, workOrderId, dto);
  }

  @Patch(':id/tasks/:taskId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update Execution Task Status' })
  @ApiParam({ name: 'id', description: 'WorkOrder UUID' })
  @ApiParam({ name: 'taskId', description: 'WorkTask UUID' })
  @ApiResponse({ status: 200, description: 'Task updated successfully.' })
  async updateTask(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') workOrderId: string,
    @Param('taskId') taskId: string,
    @Body() dto: UpdateWorkTaskDto,
  ) {
    return this.taskService.updateTask(user.id, user.role, workOrderId, taskId, dto);
  }

  @Delete(':id/tasks/:taskId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete Execution Task' })
  @ApiParam({ name: 'id', description: 'WorkOrder UUID' })
  @ApiParam({ name: 'taskId', description: 'WorkTask UUID' })
  @ApiResponse({ status: 200, description: 'Task deleted successfully.' })
  async deleteTask(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') workOrderId: string,
    @Param('taskId') taskId: string,
  ) {
    return this.taskService.deleteTask(user.id, user.role, workOrderId, taskId);
  }

  @Post(':id/logs')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Add Progress Note / Work Log Entry' })
  @ApiParam({ name: 'id', description: 'WorkOrder UUID' })
  @ApiResponse({ status: 201, description: 'Progress log recorded successfully.' })
  async addWorkLog(
    @CurrentUser('id') userId: string,
    @Param('id') workOrderId: string,
    @Body() dto: AddWorkLogDto,
  ) {
    return this.logService.addWorkLog(userId, workOrderId, dto);
  }

  @Get(':id/logs')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get Work Order Progress Logs' })
  @ApiParam({ name: 'id', description: 'WorkOrder UUID' })
  async getWorkLogs(@Param('id') workOrderId: string) {
    return this.logService.getWorkLogs(workOrderId);
  }

  @Get(':id/timeline')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get Work Order Chronological Execution Timeline' })
  @ApiParam({ name: 'id', description: 'WorkOrder UUID' })
  async getWorkTimeline(@Param('id') workOrderId: string) {
    return this.logService.getWorkTimeline(workOrderId);
  }

  @Post(':id/attachments')
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload Completion Photo or Document' })
  @ApiParam({ name: 'id', description: 'WorkOrder UUID' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'Completion photo or document (JPEG/PNG/WEBP/PDF <= 10MB)',
        },
        workTaskId: {
          type: 'string',
          description: 'Optional WorkTask UUID to link attachment to a specific task',
        },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'Completion photo uploaded successfully.' })
  async uploadAttachment(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') workOrderId: string,
    @UploadedFile() file: any,
    @Body('workTaskId') workTaskId?: string,
  ) {
    if (!file || !file.buffer) {
      throw new Error('File is required in request body as "file"');
    }
    return this.attachmentService.uploadAttachment(
      user.id,
      user.role,
      workOrderId,
      file.buffer,
      file.originalname || 'completion_photo.jpg',
      file.mimetype || 'image/jpeg',
      workTaskId,
    );
  }

  @Delete(':id/attachments/:attachmentId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete Work Order Attachment' })
  @ApiParam({ name: 'id', description: 'WorkOrder UUID' })
  @ApiParam({ name: 'attachmentId', description: 'Attachment UUID' })
  @ApiResponse({ status: 200, description: 'Attachment deleted successfully.' })
  async deleteAttachment(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') workOrderId: string,
    @Param('attachmentId') attachmentId: string,
  ) {
    return this.attachmentService.deleteAttachment(user.id, user.role, workOrderId, attachmentId);
  }
}
