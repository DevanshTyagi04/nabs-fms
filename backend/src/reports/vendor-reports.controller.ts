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

@ApiTags('Reports (Vendor)')
@ApiBearerAuth('JWT-auth')
@Roles(UserRole.VENDOR)
@Controller('vendor/reports')
export class VendorReportController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('dashboard')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'View Vendor Operational Dashboard Summary' })
  @ApiResponse({ status: 200, description: 'Vendor dashboard summary returned.' })
  async getVendorDashboard(
    @CurrentUser('id') userId: string,
    @Query() query: QueryReportDateDto,
  ) {
    return this.reportsService.getVendorDashboard(userId, query);
  }
}
