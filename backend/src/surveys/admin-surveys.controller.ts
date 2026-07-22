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
import { AddSurveyCommentDto, QuerySurveyDto, ReviewSurveyDto } from './dto';
import { SurveysService } from './surveys.service';

@ApiTags('Surveys (Admin)')
@ApiBearerAuth('JWT-auth')
@Roles(UserRole.ADMIN)
@Controller('admin/surveys')
export class AdminSurveyController {
  constructor(private readonly surveysService: SurveysService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'View All Platform Technical Surveys',
    description: 'Lists all surveys platform-wide with search, filtering by status/severity/vendor, sorting, and pagination.',
  })
  @ApiResponse({ status: 200, description: 'Surveys retrieved successfully.' })
  async getAllSurveys(@Query() query: QuerySurveyDto) {
    return this.surveysService.getAllSurveysAdmin(query);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get Comprehensive Survey Details for Admin' })
  @ApiParam({ name: 'id', description: 'Survey UUID' })
  @ApiResponse({ status: 200, description: 'Detailed survey inspection context returned.' })
  @ApiResponse({ status: 404, description: 'Survey not found.' })
  async getSurveyById(@Param('id') surveyId: string) {
    return this.surveysService.getSurveyByIdAdmin(surveyId);
  }

  @Post(':id/review')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Review (Approve or Reject) Submitted Survey',
    description:
      'Approves or Rejects a SUBMITTED survey. If APPROVED, updates related ServiceRequest status to SURVEY_APPROVED.',
  })
  @ApiParam({ name: 'id', description: 'Survey UUID' })
  @ApiResponse({ status: 200, description: 'Survey reviewed successfully.' })
  @ApiResponse({ status: 400, description: 'Survey must be in SUBMITTED status to review.' })
  async reviewSurvey(
    @CurrentUser('id') adminUserId: string,
    @Param('id') surveyId: string,
    @Body() dto: ReviewSurveyDto,
  ) {
    return this.surveysService.reviewSurveyAdmin(adminUserId, surveyId, dto);
  }

  @Post(':id/comments')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Add Internal Staff Review Comment' })
  @ApiParam({ name: 'id', description: 'Survey UUID' })
  @ApiResponse({ status: 201, description: 'Review comment added successfully.' })
  async addSurveyComment(
    @CurrentUser('id') adminUserId: string,
    @Param('id') surveyId: string,
    @Body() dto: AddSurveyCommentDto,
  ) {
    return this.surveysService.addSurveyCommentAdmin(adminUserId, surveyId, dto);
  }
}
