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
import {
  AddInternalNoteDto,
  AssignVendorDto,
  ChangeStatusDto,
  QueryServiceRequestDto,
} from './dto';
import { ServiceRequestService } from './service-requests.service';

@ApiTags('Service Requests (Admin)')
@ApiBearerAuth('JWT-auth')
@Roles(UserRole.ADMIN)
@Controller('admin/service-requests')
export class AdminServiceRequestController {
  constructor(private readonly requestService: ServiceRequestService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'View All Service Requests Platform-Wide',
    description: 'Lists all platform service requests with search, multi-field filtering, sorting, and pagination.',
  })
  @ApiResponse({ status: 200, description: 'Service requests retrieved successfully.' })
  async getAllRequests(@Query() query: QueryServiceRequestDto) {
    return this.requestService.getAllRequestsAdmin(query);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get Service Request Comprehensive Admin Details' })
  @ApiParam({ name: 'id', description: 'ServiceRequest UUID' })
  @ApiResponse({ status: 200, description: 'Detailed request context returned.' })
  @ApiResponse({ status: 404, description: 'Request not found.' })
  async getRequestById(@Param('id') requestId: string) {
    return this.requestService.getRequestByIdAdmin(requestId);
  }

  @Post(':id/assign')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Assign Vendor to Service Request',
    description:
      'Validates vendor verification & availability status, assigns vendor, and transitions status to ASSIGNED.',
  })
  @ApiParam({ name: 'id', description: 'ServiceRequest UUID' })
  @ApiResponse({ status: 200, description: 'Vendor assigned successfully.' })
  @ApiResponse({ status: 422, description: 'Vendor ineligible or invalid status transition.' })
  async assignVendor(
    @CurrentUser('id') adminUserId: string,
    @Param('id') requestId: string,
    @Body() dto: AssignVendorDto,
  ) {
    return this.requestService.assignVendorAdmin(adminUserId, requestId, dto);
  }

  @Post(':id/reassign')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reassign Vendor on Service Request' })
  @ApiParam({ name: 'id', description: 'ServiceRequest UUID' })
  @ApiResponse({ status: 200, description: 'Vendor reassigned successfully.' })
  async reassignVendor(
    @CurrentUser('id') adminUserId: string,
    @Param('id') requestId: string,
    @Body() dto: AssignVendorDto,
  ) {
    return this.requestService.assignVendorAdmin(adminUserId, requestId, dto);
  }

  @Post(':id/notes')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Add Internal Staff Note' })
  @ApiParam({ name: 'id', description: 'ServiceRequest UUID' })
  @ApiResponse({ status: 201, description: 'Internal note added successfully.' })
  async addInternalNote(
    @CurrentUser('id') adminUserId: string,
    @Param('id') requestId: string,
    @Body() dto: AddInternalNoteDto,
  ) {
    return this.requestService.addInternalNoteAdmin(adminUserId, requestId, dto);
  }

  @Post(':id/status')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Manual Status Change via State Machine' })
  @ApiParam({ name: 'id', description: 'ServiceRequest UUID' })
  @ApiResponse({ status: 200, description: 'Request status updated successfully.' })
  @ApiResponse({ status: 422, description: 'Invalid state machine transition.' })
  async changeStatus(
    @CurrentUser('id') adminUserId: string,
    @Param('id') requestId: string,
    @Body() dto: ChangeStatusDto,
  ) {
    return this.requestService.changeStatusAdmin(adminUserId, requestId, dto);
  }
}
