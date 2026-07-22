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
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { CurrentUser, Roles } from '../../auth/decorators';
import { ActivityService } from '../activity.service';
import { QueryActivityDto } from '../dto';

@ApiTags('Audit & Activity Center (Admin)')
@ApiBearerAuth('JWT-auth')
@Roles(UserRole.ADMIN)
@Controller('admin/activity')
export class AdminActivityController {
  constructor(private readonly activityService: ActivityService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Platform-Wide Chronological Activity Timeline Feed (Admin)' })
  @ApiResponse({ status: 200, description: 'Platform activity feed returned.' })
  async getAdminActivityTimeline(
    @CurrentUser('id') userId: string,
    @Query() query: QueryActivityDto,
  ) {
    return this.activityService.getActivityTimeline(userId, query);
  }

  @Get('entity/:entity/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Retrieve Complete Lifecycle History for Specific Entity Instance' })
  @ApiResponse({ status: 200, description: 'Entity lifecycle history returned.' })
  async getEntityHistory(
    @Param('entity') entity: string,
    @Param('id') entityId: string,
  ) {
    return this.activityService.getEntityHistory(entity, entityId);
  }
}
