import {
  Body,
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
import { UserRole } from '@prisma/client';
import { CurrentUser, Roles } from '../auth/decorators';
import { AddEstimateCommentDto, QueryEstimateDto } from './dto';
import { EstimatesService } from './estimates.service';

@ApiTags('Estimates (Admin)')
@ApiBearerAuth('JWT-auth')
@Roles(UserRole.ADMIN)
@Controller('admin/estimates')
export class AdminEstimateController {
  constructor(private readonly estimatesService: EstimatesService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'View All Platform Estimate Quotations',
    description: 'Lists all estimates platform-wide with search, filtering by status/vendor/customer, sorting, and pagination.',
  })
  @ApiResponse({ status: 200, description: 'Estimates retrieved successfully.' })
  async getAllEstimates(@Query() query: QueryEstimateDto) {
    return this.estimatesService.getAllEstimatesAdmin(query);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get Comprehensive Estimate Details for Admin' })
  @ApiParam({ name: 'id', description: 'Estimate UUID' })
  @ApiResponse({ status: 200, description: 'Detailed estimate context returned.' })
  @ApiResponse({ status: 404, description: 'Estimate not found.' })
  async getEstimateById(@Param('id') estimateId: string) {
    return this.estimatesService.getEstimateByIdAdmin(estimateId);
  }

  @Post(':id/comments')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Add Internal Staff Review Comment' })
  @ApiParam({ name: 'id', description: 'Estimate UUID' })
  @ApiResponse({ status: 201, description: 'Review comment added successfully.' })
  async addEstimateComment(
    @CurrentUser('id') adminUserId: string,
    @Param('id') estimateId: string,
    @Body() dto: AddEstimateCommentDto,
  ) {
    return this.estimatesService.addEstimateCommentAdmin(adminUserId, estimateId, dto);
  }
}
