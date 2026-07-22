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
import { CurrentUser, Roles } from '../auth/decorators';
import { QueryReportDateDto } from './dto';
import { ReportsService } from './reports.service';

@ApiTags('Reports (Customer)')
@ApiBearerAuth('JWT-auth')
@Roles(UserRole.CUSTOMER)
@Controller('customer/reports')
export class CustomerReportController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('dashboard')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'View Customer Service & Financial Dashboard Summary' })
  @ApiResponse({ status: 200, description: 'Customer dashboard summary returned.' })
  async getCustomerDashboard(
    @CurrentUser('id') userId: string,
    @Query() query: QueryReportDateDto,
  ) {
    return this.reportsService.getCustomerDashboard(userId, query);
  }
}
