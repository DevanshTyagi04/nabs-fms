import {
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
import { CurrentUser } from '../auth/decorators';
import { QueryNotificationDto } from './dto';
import { NotificationsService } from './notifications.service';

@ApiTags('Notifications')
@ApiBearerAuth('JWT-auth')
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'List Authenticated User Notifications' })
  @ApiResponse({ status: 200, description: 'Notifications retrieved successfully.' })
  async getMyNotifications(
    @CurrentUser('id') userId: string,
    @Query() query: QueryNotificationDto,
  ) {
    return this.notificationsService.getUserNotifications(userId, query);
  }

  @Get('unread-count')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get Total Unread Notification Count' })
  @ApiResponse({ status: 200, description: 'Unread notification count returned.' })
  async getUnreadCount(@CurrentUser('id') userId: string) {
    return this.notificationsService.getUnreadCount(userId);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get Notification Details' })
  @ApiParam({ name: 'id', description: 'Notification UUID' })
  @ApiResponse({ status: 200, description: 'Notification details returned.' })
  @ApiResponse({ status: 403, description: 'Forbidden: Not your notification.' })
  async getNotificationById(
    @CurrentUser('id') userId: string,
    @Param('id') notificationId: string,
  ) {
    return this.notificationsService.getNotificationById(userId, notificationId);
  }

  @Post(':id/read')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Mark Single Notification as Read (Idempotent)' })
  @ApiParam({ name: 'id', description: 'Notification UUID' })
  @ApiResponse({ status: 200, description: 'Notification marked as read successfully.' })
  async markAsRead(
    @CurrentUser('id') userId: string,
    @Param('id') notificationId: string,
  ) {
    return this.notificationsService.markAsRead(userId, notificationId);
  }

  @Post('read-all')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Mark All Notifications as Read (Idempotent)' })
  @ApiResponse({ status: 200, description: 'All notifications marked as read.' })
  async markAllAsRead(@CurrentUser('id') userId: string) {
    return this.notificationsService.markAllAsRead(userId);
  }
}
