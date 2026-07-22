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
import { SurveyAttachmentService } from './attachment/survey-attachment.service';
import {
  CreateSurveyDto,
  CreateSurveyItemDto,
  QuerySurveyDto,
  UpdateSurveyItemDto,
  UpdateSurveyNotesDto,
} from './dto';
import { SurveysService } from './surveys.service';

@ApiTags('Surveys (Vendor)')
@ApiBearerAuth('JWT-auth')
@Roles(UserRole.VENDOR)
@Controller('vendor/surveys')
export class VendorSurveyController {
  constructor(
    private readonly surveysService: SurveysService,
    private readonly attachmentService: SurveyAttachmentService,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create Survey Draft or Revised Version',
    description:
      'Creates a new Survey Draft for assigned Service Request. If a submitted/reviewed survey exists, creates a revised version (version + 1) and supersedes previous version.',
  })
  @ApiResponse({ status: 201, description: 'Survey draft created successfully.' })
  @ApiResponse({ status: 400, description: 'Service request cancelled or vendor not assigned.' })
  async createSurvey(
    @CurrentUser('id') userId: string,
    @Body() dto: CreateSurveyDto,
  ) {
    return this.surveysService.createOrVersionSurveyVendor(userId, dto);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'List Vendor Surveys' })
  @ApiResponse({ status: 200, description: 'Vendor surveys retrieved successfully.' })
  async getVendorSurveys(
    @CurrentUser('id') userId: string,
    @Query() query: QuerySurveyDto,
  ) {
    return this.surveysService.getVendorSurveys(userId, query);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get Survey Details' })
  @ApiParam({ name: 'id', description: 'Survey UUID' })
  @ApiResponse({ status: 200, description: 'Survey inspection details returned.' })
  @ApiResponse({ status: 403, description: 'Forbidden: You do not own this survey.' })
  async getVendorSurveyById(
    @CurrentUser('id') userId: string,
    @Param('id') surveyId: string,
  ) {
    return this.surveysService.getVendorSurveyById(userId, surveyId);
  }

  @Patch(':id/notes')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update Survey Draft Notes' })
  @ApiParam({ name: 'id', description: 'Survey UUID' })
  @ApiResponse({ status: 200, description: 'Notes updated successfully.' })
  async updateSurveyNotes(
    @CurrentUser('id') userId: string,
    @Param('id') surveyId: string,
    @Body() dto: UpdateSurveyNotesDto,
  ) {
    return this.surveysService.updateSurveyNotesVendor(userId, surveyId, dto);
  }

  @Post(':id/items')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Add Inspection Item to Survey Draft' })
  @ApiParam({ name: 'id', description: 'Survey UUID' })
  @ApiResponse({ status: 201, description: 'Survey item added successfully.' })
  async createSurveyItem(
    @CurrentUser('id') userId: string,
    @Param('id') surveyId: string,
    @Body() dto: CreateSurveyItemDto,
  ) {
    return this.surveysService.createSurveyItemVendor(userId, surveyId, dto);
  }

  @Patch(':id/items/:itemId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update Draft Inspection Item' })
  @ApiParam({ name: 'id', description: 'Survey UUID' })
  @ApiParam({ name: 'itemId', description: 'SurveyItem UUID' })
  @ApiResponse({ status: 200, description: 'Survey item updated successfully.' })
  async updateSurveyItem(
    @CurrentUser('id') userId: string,
    @Param('id') surveyId: string,
    @Param('itemId') itemId: string,
    @Body() dto: UpdateSurveyItemDto,
  ) {
    return this.surveysService.updateSurveyItemVendor(userId, surveyId, itemId, dto);
  }

  @Delete(':id/items/:itemId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete Draft Inspection Item' })
  @ApiParam({ name: 'id', description: 'Survey UUID' })
  @ApiParam({ name: 'itemId', description: 'SurveyItem UUID' })
  @ApiResponse({ status: 200, description: 'Survey item deleted successfully.' })
  async deleteSurveyItem(
    @CurrentUser('id') userId: string,
    @Param('id') surveyId: string,
    @Param('itemId') itemId: string,
  ) {
    return this.surveysService.deleteSurveyItemVendor(userId, surveyId, itemId);
  }

  @Post(':id/submit')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Submit Completed Technical Survey',
    description:
      'Validates mandatory items and photo requirements, transitions survey status DRAFT -> SUBMITTED, and updates request status to SURVEY_SUBMITTED.',
  })
  @ApiParam({ name: 'id', description: 'Survey UUID' })
  @ApiResponse({ status: 200, description: 'Survey submitted successfully.' })
  @ApiResponse({ status: 422, description: 'Submission validation failed (missing mandatory items/photos).' })
  async submitSurvey(
    @CurrentUser('id') userId: string,
    @Param('id') surveyId: string,
  ) {
    return this.surveysService.submitSurveyVendor(userId, surveyId);
  }

  @Post(':id/attachments')
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload Inspection Photo/Document Attachment' })
  @ApiParam({ name: 'id', description: 'Survey UUID' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'Inspection photo or document (JPEG/PNG/WEBP/PDF <= 10MB)',
        },
        surveyItemId: {
          type: 'string',
          description: 'Optional SurveyItem UUID to link photo directly to specific item',
        },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'Photo attachment uploaded successfully.' })
  async uploadAttachment(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') surveyId: string,
    @UploadedFile() file: any,
    @Body('surveyItemId') surveyItemId?: string,
  ) {
    if (!file || !file.buffer) {
      throw new Error('Inspection file is required in request body as "file"');
    }
    return this.attachmentService.uploadAttachment(
      user.id,
      user.role,
      surveyId,
      file.buffer,
      file.originalname || 'photo.jpg',
      file.mimetype || 'image/jpeg',
      surveyItemId,
    );
  }

  @Delete(':id/attachments/:attachmentId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete Survey Attachment' })
  @ApiParam({ name: 'id', description: 'Survey UUID' })
  @ApiParam({ name: 'attachmentId', description: 'Attachment UUID' })
  @ApiResponse({ status: 200, description: 'Attachment deleted successfully.' })
  async deleteAttachment(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') surveyId: string,
    @Param('attachmentId') attachmentId: string,
  ) {
    return this.attachmentService.deleteAttachment(user.id, user.role, surveyId, attachmentId);
  }
}
