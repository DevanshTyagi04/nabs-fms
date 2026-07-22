import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUser } from '../../auth/decorators';
import { SessionsService } from './sessions.service';

@ApiTags('Session Management')
@ApiBearerAuth('JWT-auth')
@Controller('users/me/sessions')
export class SessionsController {
  constructor(private readonly sessionsService: SessionsService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'List Active Sessions',
    description:
      'Retrieves device, browser, platform, and IP metadata for all active non-revoked sessions belonging to the authenticated user.',
  })
  @ApiResponse({ status: 200, description: 'Active sessions retrieved successfully.' })
  async listActiveSessions(@CurrentUser('id') userId: string) {
    return this.sessionsService.listActiveSessions(userId);
  }

  @Get('current')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get Current Active Session Details' })
  @ApiResponse({ status: 200, description: 'Current session context returned.' })
  async getCurrentSession(@CurrentUser('id') userId: string) {
    return this.sessionsService.getCurrentSession(userId);
  }

  @Post('revoke-all')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Logout All Sessions',
    description: 'Bulk revokes all active refresh token sessions for the authenticated user in a single query.',
  })
  @ApiResponse({ status: 200, description: 'All sessions logged out successfully.' })
  async revokeAllSessions(@CurrentUser('id') userId: string) {
    return this.sessionsService.revokeAllSessions(userId);
  }

  @Post(':sessionId/revoke')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Logout Specific Device Session' })
  @ApiParam({ name: 'sessionId', description: 'RefreshToken UUID' })
  @ApiResponse({ status: 200, description: 'Session revoked successfully.' })
  @ApiResponse({ status: 403, description: 'Forbidden: Cannot revoke session belonging to another user.' })
  @ApiResponse({ status: 404, description: 'Session not found.' })
  async revokeSession(
    @CurrentUser('id') userId: string,
    @Param('sessionId') sessionId: string,
  ) {
    return this.sessionsService.revokeSession(userId, sessionId);
  }
}
