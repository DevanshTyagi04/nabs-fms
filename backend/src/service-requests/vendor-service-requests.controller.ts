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
import { QueryServiceRequestDto, VendorResponseDto } from './dto';
import { ServiceRequestService } from './service-requests.service';

@ApiTags('Service Requests (Vendor)')
@ApiBearerAuth('JWT-auth')
@Roles(UserRole.VENDOR)
@Controller('vendor/service-requests')
export class VendorServiceRequestController {
  constructor(private readonly requestService: ServiceRequestService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'List Vendor Assigned Requests',
    description: 'Lists service requests assigned to the authenticated Vendor with search, filtering, and pagination.',
  })
  @ApiResponse({ status: 200, description: 'Assigned requests retrieved successfully.' })
  async getAssignedRequests(
    @CurrentUser('id') userId: string,
    @Query() query: QueryServiceRequestDto,
  ) {
    return this.requestService.getAssignedRequestsVendor(userId, query);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get Assigned Service Request Details' })
  @ApiParam({ name: 'id', description: 'ServiceRequest UUID' })
  @ApiResponse({ status: 200, description: 'Assigned request details returned.' })
  @ApiResponse({ status: 403, description: 'Forbidden: Request not assigned to you.' })
  @ApiResponse({ status: 404, description: 'Request not found.' })
  async getAssignedRequestById(
    @CurrentUser('id') userId: string,
    @Param('id') requestId: string,
  ) {
    return this.requestService.getAssignedRequestByIdVendor(userId, requestId);
  }

  @Post(':id/accept')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Accept Service Request Assignment' })
  @ApiParam({ name: 'id', description: 'ServiceRequest UUID' })
  @ApiResponse({ status: 200, description: 'Assignment accepted successfully.' })
  async acceptAssignment(
    @CurrentUser('id') userId: string,
    @Param('id') requestId: string,
    @Body() dto?: VendorResponseDto,
  ) {
    return this.requestService.acceptAssignmentVendor(userId, requestId, dto);
  }

  @Post(':id/reject')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Reject Service Request Assignment',
    description: 'Rejects assignment (transitions ASSIGNED -> CREATED and clears vendor ID, returning request to unassigned pool).',
  })
  @ApiParam({ name: 'id', description: 'ServiceRequest UUID' })
  @ApiResponse({ status: 200, description: 'Assignment rejected successfully. Request returned to unassigned pool.' })
  async rejectAssignment(
    @CurrentUser('id') userId: string,
    @Param('id') requestId: string,
    @Body() dto?: VendorResponseDto,
  ) {
    return this.requestService.rejectAssignmentVendor(userId, requestId, dto);
  }
}
