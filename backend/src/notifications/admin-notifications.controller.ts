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
import { QueryNotificationDto } from './dto';
import { NotificationsService } from './notifications.service';

@ApiTags('Notifications (Admin)')
@ApiBearerAuth('JWT-auth')
@Roles(UserRole.ADMIN)
@Controller('admin/notifications')
export class AdminNotificationController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'View Platform Notification Delivery Logs' })
  @ApiResponse({ status: 200, description: 'All notification logs returned.' })
  async getAllNotifications(@Query() query: QueryNotificationDto) {
    return this.notificationsService.getAllNotificationsAdmin(query);
  }
}
