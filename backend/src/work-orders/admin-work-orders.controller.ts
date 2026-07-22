import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { CurrentUser, Roles } from '../auth/decorators';
import { CreateWorkOrderDto, QueryWorkOrderDto } from './dto';
import { WorkOrdersService } from './work-orders.service';

@ApiTags('Work Orders (Admin)')
@ApiBearerAuth('JWT-auth')
@Roles(UserRole.ADMIN)
@Controller('admin/work-orders')
export class AdminWorkOrderController {
  constructor(private readonly workOrdersService: WorkOrdersService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create Work Order from Approved Estimate',
    description:
      'Creates a new Work Order from an APPROVED estimate. Generates collision-safe WO number (WO-YYYYMMDD-XXXX) and initializes timeline.',
  })
  @ApiResponse({ status: 201, description: 'Work Order created successfully.' })
  @ApiResponse({ status: 400, description: 'Estimate not approved or active Work Order already exists.' })
  async createWorkOrder(
    @CurrentUser('id') adminUserId: string,
    @Body() dto: CreateWorkOrderDto,
  ) {
    return this.workOrdersService.createWorkOrderAdmin(adminUserId, dto);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'View All Platform Work Orders' })
  @ApiResponse({ status: 200, description: 'Work Orders retrieved successfully.' })
  async getAllWorkOrders(@Query() query: QueryWorkOrderDto) {
    return this.workOrdersService.getAllWorkOrdersAdmin(query);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get Comprehensive Work Order Details for Admin' })
  @ApiParam({ name: 'id', description: 'WorkOrder UUID' })
  @ApiResponse({ status: 200, description: 'Detailed execution context returned.' })
  @ApiResponse({ status: 404, description: 'Work Order not found.' })
  async getWorkOrderById(@Param('id') workOrderId: string) {
    return this.workOrdersService.getWorkOrderByIdAdmin(workOrderId);
  }

  @Post(':id/verify')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Verify Work Order Completion (Admin QA Milestone)',
    description:
      'Verifies a COMPLETED Work Order, recording the WORK_VERIFIED milestone event for invoice eligibility.',
  })
  @ApiParam({ name: 'id', description: 'WorkOrder UUID' })
  @ApiResponse({ status: 200, description: 'Work Order verified successfully.' })
  @ApiResponse({ status: 400, description: 'Work Order must be in COMPLETED status to verify.' })
  async verifyWorkOrder(
    @CurrentUser('id') adminUserId: string,
    @Param('id') workOrderId: string,
    @Body('remarks') remarks?: string,
  ) {
    return this.workOrdersService.verifyWorkOrderAdmin(adminUserId, workOrderId, remarks);
  }

  @Post(':id/cancel')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Cancel Work Order' })
  @ApiParam({ name: 'id', description: 'WorkOrder UUID' })
  @ApiResponse({ status: 200, description: 'Work Order cancelled successfully.' })
  async cancelWorkOrder(
    @CurrentUser('id') adminUserId: string,
    @Param('id') workOrderId: string,
    @Body('reason') reason?: string,
  ) {
    return this.workOrdersService.cancelWorkOrderAdmin(adminUserId, workOrderId, reason);
  }
}
