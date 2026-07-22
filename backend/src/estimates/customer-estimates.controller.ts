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
import { QueryEstimateDto, RejectEstimateDto } from './dto';
import { EstimatesService } from './estimates.service';

@ApiTags('Estimates (Customer)')
@ApiBearerAuth('JWT-auth')
@Roles(UserRole.CUSTOMER)
@Controller('customer/estimates')
export class CustomerEstimateController {
  constructor(private readonly estimatesService: EstimatesService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'List Estimates for My Service Requests',
    description: 'Lists estimates in PENDING_APPROVAL, APPROVED, or REJECTED status for Customer service requests.',
  })
  @ApiResponse({ status: 200, description: 'Estimates retrieved successfully.' })
  async getMyEstimates(
    @CurrentUser('id') userId: string,
    @Query() query: QueryEstimateDto,
  ) {
    return this.estimatesService.getCustomerEstimates(userId, query);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get Customer Estimate Quotation Details' })
  @ApiParam({ name: 'id', description: 'Estimate UUID' })
  @ApiResponse({ status: 200, description: 'Estimate details returned.' })
  @ApiResponse({ status: 403, description: 'Forbidden: Draft state or not your request.' })
  async getMyEstimateById(
    @CurrentUser('id') userId: string,
    @Param('id') estimateId: string,
  ) {
    return this.estimatesService.getCustomerEstimateById(userId, estimateId);
  }

  @Post(':id/approve')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Approve Quotation Estimate',
    description:
      'Customer approves quotation estimate (PENDING_APPROVAL -> APPROVED). Validates expiration date and transitions related ServiceRequest status.',
  })
  @ApiParam({ name: 'id', description: 'Estimate UUID' })
  @ApiResponse({ status: 200, description: 'Quotation approved successfully.' })
  @ApiResponse({ status: 422, description: 'Quotation has expired or is not pending approval.' })
  async approveEstimate(
    @CurrentUser('id') userId: string,
    @Param('id') estimateId: string,
  ) {
    return this.estimatesService.approveEstimateCustomer(userId, estimateId);
  }

  @Post(':id/reject')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reject Quotation Estimate' })
  @ApiParam({ name: 'id', description: 'Estimate UUID' })
  @ApiResponse({ status: 200, description: 'Quotation rejected.' })
  async rejectEstimate(
    @CurrentUser('id') userId: string,
    @Param('id') estimateId: string,
    @Body() dto?: RejectEstimateDto,
  ) {
    return this.estimatesService.rejectEstimateCustomer(userId, estimateId, dto);
  }
}
