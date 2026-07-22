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
import { CurrentUser, Roles } from '../../auth/decorators';
import { ActivityService } from '../activity.service';
import { QueryActivityDto } from '../dto';

@ApiTags('Audit & Activity Center (Vendor)')
@ApiBearerAuth('JWT-auth')
@Roles(UserRole.VENDOR)
@Controller('vendor/activity')
export class VendorActivityController {
  constructor(private readonly activityService: ActivityService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Vendor-Scoped Chronological Activity Timeline Feed' })
  @ApiResponse({ status: 200, description: 'Vendor activity feed returned.' })
  async getVendorActivityTimeline(
    @CurrentUser('id') userId: string,
    @Query() query: QueryActivityDto,
  ) {
    return this.activityService.getActivityTimeline(userId, query);
  }
}
