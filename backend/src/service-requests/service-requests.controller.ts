import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { CurrentUser, Roles } from '../auth/decorators';
import { AuthenticatedUser } from '../auth/interfaces';
import { RequestAttachmentService } from './attachment/request-attachment.service';
import { CreateServiceRequestDto, QueryServiceRequestDto } from './dto';
import { ServiceRequestService } from './service-requests.service';

@ApiTags('Service Requests (Customer)')
@ApiBearerAuth('JWT-auth')
@Roles(UserRole.CUSTOMER)
@Controller('service-requests')
export class ServiceRequestController {
  constructor(
    private readonly requestService: ServiceRequestService,
    private readonly attachmentService: RequestAttachmentService,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create New Service Request',
    description:
      'Creates a new service request for the authenticated Customer. Generates a unique collision-safe ticket number (SR-YYYYMMDD-XXXX) and records initial CREATED history.',
  })
  @ApiResponse({ status: 201, description: 'Service request created successfully.' })
  @ApiResponse({ status: 400, description: 'Invalid address or category provided.' })
  async createRequest(
    @CurrentUser('id') userId: string,
    @Body() dto: CreateServiceRequestDto,
  ) {
    return this.requestService.createRequestCustomer(userId, dto);
  }

  @Get('my-requests')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'List My Service Requests',
    description:
      'Lists service requests created by the authenticated Customer with search, filtering, sorting, and pagination.',
  })
  @ApiResponse({ status: 200, description: 'Service requests retrieved successfully.' })
  async getMyRequests(
    @CurrentUser('id') userId: string,
    @Query() query: QueryServiceRequestDto,
  ) {
    return this.requestService.getCustomerRequests(userId, query);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get Service Request Details' })
  @ApiParam({ name: 'id', description: 'ServiceRequest UUID' })
  @ApiResponse({ status: 200, description: 'Request details returned.' })
  @ApiResponse({ status: 403, description: 'Forbidden: Not your request.' })
  @ApiResponse({ status: 404, description: 'Request not found.' })
  async getRequestById(
    @CurrentUser('id') userId: string,
    @Param('id') requestId: string,
  ) {
    return this.requestService.getCustomerRequestById(userId, requestId);
  }

  @Post(':id/cancel')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Cancel Service Request',
    description: 'Cancels a service request before work starts (transitions CREATED/ASSIGNED to CANCELLED).',
  })
  @ApiParam({ name: 'id', description: 'ServiceRequest UUID' })
  @ApiResponse({ status: 200, description: 'Service request cancelled successfully.' })
  @ApiResponse({ status: 422, description: 'Invalid transition state.' })
  async cancelRequest(
    @CurrentUser('id') userId: string,
    @Param('id') requestId: string,
    @Body('remarks') remarks?: string,
  ) {
    return this.requestService.cancelCustomerRequest(userId, requestId, remarks);
  }

  @Post(':id/attachments')
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload Attachment for Service Request' })
  @ApiParam({ name: 'id', description: 'ServiceRequest UUID' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'Attachment file (JPEG/PNG/WEBP/PDF <= 10MB)',
        },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'Attachment uploaded successfully.' })
  async uploadAttachment(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') requestId: string,
    @UploadedFile() file: any,
  ) {
    if (!file || !file.buffer) {
      throw new Error('Attachment file is required in body as "file"');
    }
    return this.attachmentService.uploadAttachment(
      user.id,
      user.role,
      requestId,
      file.buffer,
      file.originalname || 'attachment.pdf',
      file.mimetype || 'application/pdf',
    );
  }

  @Delete(':id/attachments/:attachmentId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete Request Attachment' })
  @ApiParam({ name: 'id', description: 'ServiceRequest UUID' })
  @ApiParam({ name: 'attachmentId', description: 'Attachment UUID' })
  @ApiResponse({ status: 200, description: 'Attachment deleted successfully.' })
  async deleteAttachment(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') requestId: string,
    @Param('attachmentId') attachmentId: string,
  ) {
    return this.attachmentService.deleteAttachment(user.id, user.role, requestId, attachmentId);
  }
}
