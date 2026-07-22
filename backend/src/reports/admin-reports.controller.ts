import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Query,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { Roles } from '../auth/decorators';
import { QueryReportDateDto } from './dto';
import { ReportsService } from './reports.service';

@ApiTags('Reports (Admin)')
@ApiBearerAuth('JWT-auth')
@Roles(UserRole.ADMIN)
@Controller('admin/reports')
export class AdminReportController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('dashboard')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'View Admin Executive Dashboard Metrics Summary' })
  @ApiResponse({ status: 200, description: 'Executive dashboard metrics returned.' })
  async getDashboard(@Query() query: QueryReportDateDto) {
    return this.reportsService.getAdminDashboard(query);
  }

  @Get('revenue')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'View Financial & Revenue Analytics Reports' })
  @ApiResponse({ status: 200, description: 'Revenue analytics breakdown returned.' })
  async getRevenueReports(@Query() query: QueryReportDateDto) {
    return this.reportsService.getRevenueReports(query);
  }

  @Get('services')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'View Service & Request Status Analytics' })
  @ApiResponse({ status: 200, description: 'Service status distributions returned.' })
  async getServiceReports(@Query() query: QueryReportDateDto) {
    return this.reportsService.getServiceReports(query);
  }

  @Get('payments')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'View Payment Gateway & Transaction Status Analytics' })
  @ApiResponse({ status: 200, description: 'Payment analytics returned.' })
  async getPaymentReports(@Query() query: QueryReportDateDto) {
    return this.reportsService.getPaymentReports(query);
  }

  @Get('work-orders')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'View Work Order Execution Status Analytics' })
  @ApiResponse({ status: 200, description: 'Work order execution analytics returned.' })
  async getWorkOrderReports(@Query() query: QueryReportDateDto) {
    return this.reportsService.getWorkOrderReports(query);
  }
}
