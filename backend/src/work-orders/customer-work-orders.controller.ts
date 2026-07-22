import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
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
import { QueryWorkOrderDto } from './dto';
import { WorkOrdersService } from './work-orders.service';

@ApiTags('Work Orders (Customer)')
@ApiBearerAuth('JWT-auth')
@Roles(UserRole.CUSTOMER)
@Controller('customer/work-orders')
export class CustomerWorkOrderController {
  constructor(private readonly workOrdersService: WorkOrdersService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'List Work Orders for My Service Requests',
    description: 'Lists Work Orders associated with Customer service requests with execution status tracking.',
  })
  @ApiResponse({ status: 200, description: 'Work Orders retrieved successfully.' })
  async getMyWorkOrders(
    @CurrentUser('id') userId: string,
    @Query() query: QueryWorkOrderDto,
  ) {
    return this.workOrdersService.getCustomerWorkOrders(userId, query);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get Customer Read-Only Work Order Progress Details' })
  @ApiParam({ name: 'id', description: 'WorkOrder UUID' })
  @ApiResponse({ status: 200, description: 'Execution details, tasks, and completion photos returned.' })
  @ApiResponse({ status: 403, description: 'Forbidden: Not your Work Order.' })
  async getMyWorkOrderById(
    @CurrentUser('id') userId: string,
    @Param('id') workOrderId: string,
  ) {
    return this.workOrdersService.getCustomerWorkOrderById(userId, workOrderId);
  }
}
