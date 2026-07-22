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

@ApiTags('Audit & Activity Center (Customer)')
@ApiBearerAuth('JWT-auth')
@Roles(UserRole.CUSTOMER)
@Controller('customer/activity')
export class CustomerActivityController {
  constructor(private readonly activityService: ActivityService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Customer-Scoped Chronological Activity Timeline Feed' })
  @ApiResponse({ status: 200, description: 'Customer activity feed returned.' })
  async getCustomerActivityTimeline(
    @CurrentUser('id') userId: string,
    @Query() query: QueryActivityDto,
  ) {
    return this.activityService.getActivityTimeline(userId, query);
  }
}
