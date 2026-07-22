import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { Roles } from '../auth/decorators';
import { QueueMetricsDto } from './dto';
import { JobsService } from './jobs.service';

@ApiTags('Background Jobs (Admin)')
@ApiBearerAuth('JWT-auth')
@Roles(UserRole.ADMIN)
@Controller('admin/jobs')
export class AdminJobController {
  constructor(private readonly jobsService: JobsService) {}

  @Get('stats')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'View Background Jobs Queue Metrics & Statistics' })
  @ApiResponse({
    status: 200,
    description: 'Queue statistics returned.',
    type: [QueueMetricsDto],
  })
  async getQueueStats() {
    return this.jobsService.getQueueMetricsAdmin();
  }
}
