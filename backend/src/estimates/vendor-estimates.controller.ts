import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
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
import {
  CreateEstimateDto,
  CreateEstimateItemDto,
  QueryEstimateDto,
  UpdateEstimateDto,
  UpdateEstimateItemDto,
} from './dto';
import { EstimatesService } from './estimates.service';

@ApiTags('Estimates (Vendor)')
@ApiBearerAuth('JWT-auth')
@Roles(UserRole.VENDOR)
@Controller('vendor/estimates')
export class VendorEstimateController {
  constructor(private readonly estimatesService: EstimatesService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create Estimate Draft or Revised Version',
    description:
      'Creates an Estimate Draft for an assigned request with an APPROVED survey. If a previous estimate exists, creates a revised version (version + 1) and marks the previous as SUPERSEDED.',
  })
  @ApiResponse({ status: 201, description: 'Estimate draft created successfully.' })
  @ApiResponse({ status: 400, description: 'Survey not approved or vendor not assigned.' })
  async createEstimate(
    @CurrentUser('id') userId: string,
    @Body() dto: CreateEstimateDto,
  ) {
    return this.estimatesService.createOrVersionEstimateVendor(userId, dto);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'List Vendor Estimates' })
  @ApiResponse({ status: 200, description: 'Vendor estimates retrieved successfully.' })
  async getVendorEstimates(
    @CurrentUser('id') userId: string,
    @Query() query: QueryEstimateDto,
  ) {
    return this.estimatesService.getVendorEstimates(userId, query);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get Estimate Quotation Details' })
  @ApiParam({ name: 'id', description: 'Estimate UUID' })
  @ApiResponse({ status: 200, description: 'Estimate details returned.' })
  @ApiResponse({ status: 403, description: 'Forbidden: You do not own this estimate.' })
  async getVendorEstimateById(
    @CurrentUser('id') userId: string,
    @Param('id') estimateId: string,
  ) {
    return this.estimatesService.getVendorEstimateById(userId, estimateId);
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update Estimate Terms, Validity Date, or Discount' })
  @ApiParam({ name: 'id', description: 'Estimate UUID' })
  @ApiResponse({ status: 200, description: 'Estimate updated successfully.' })
  async updateEstimate(
    @CurrentUser('id') userId: string,
    @Param('id') estimateId: string,
    @Body() dto: UpdateEstimateDto,
  ) {
    return this.estimatesService.updateEstimateVendor(userId, estimateId, dto);
  }

  @Post(':id/items')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Add Line Item to Estimate Draft',
    description:
      'Adds a line item and triggers automatic, deterministic recalculation of estimate subtotal, tax amount, discount, and grand total.',
  })
  @ApiParam({ name: 'id', description: 'Estimate UUID' })
  @ApiResponse({ status: 201, description: 'Estimate line item added successfully.' })
  async createEstimateItem(
    @CurrentUser('id') userId: string,
    @Param('id') estimateId: string,
    @Body() dto: CreateEstimateItemDto,
  ) {
    return this.estimatesService.createEstimateItemVendor(userId, estimateId, dto);
  }

  @Patch(':id/items/:itemId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update Draft Line Item' })
  @ApiParam({ name: 'id', description: 'Estimate UUID' })
  @ApiParam({ name: 'itemId', description: 'EstimateItem UUID' })
  @ApiResponse({ status: 200, description: 'Line item updated successfully.' })
  async updateEstimateItem(
    @CurrentUser('id') userId: string,
    @Param('id') estimateId: string,
    @Param('itemId') itemId: string,
    @Body() dto: UpdateEstimateItemDto,
  ) {
    return this.estimatesService.updateEstimateItemVendor(userId, estimateId, itemId, dto);
  }

  @Delete(':id/items/:itemId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete Draft Line Item' })
  @ApiParam({ name: 'id', description: 'Estimate UUID' })
  @ApiParam({ name: 'itemId', description: 'EstimateItem UUID' })
  @ApiResponse({ status: 200, description: 'Line item deleted successfully.' })
  async deleteEstimateItem(
    @CurrentUser('id') userId: string,
    @Param('id') estimateId: string,
    @Param('itemId') itemId: string,
  ) {
    return this.estimatesService.deleteEstimateItemVendor(userId, estimateId, itemId);
  }

  @Post(':id/submit')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Submit Estimate Quotation to Customer',
    description:
      'Validates line items exist and grand total > 0, transitions estimate status DRAFT -> PENDING_APPROVAL.',
  })
  @ApiParam({ name: 'id', description: 'Estimate UUID' })
  @ApiResponse({ status: 200, description: 'Estimate submitted successfully.' })
  @ApiResponse({ status: 422, description: 'Submission validation failed (missing line items or invalid total).' })
  async submitEstimate(
    @CurrentUser('id') userId: string,
    @Param('id') estimateId: string,
  ) {
    return this.estimatesService.submitEstimateVendor(userId, estimateId);
  }
}
