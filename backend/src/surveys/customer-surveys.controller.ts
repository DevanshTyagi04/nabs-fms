import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
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
import { QuerySurveyDto } from './dto';
import { SurveysService } from './surveys.service';

@ApiTags('Surveys (Customer)')
@ApiBearerAuth('JWT-auth')
@Roles(UserRole.CUSTOMER)
@Controller('customer/surveys')
export class CustomerSurveyController {
  constructor(private readonly surveysService: SurveysService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'List Submitted/Approved Technical Surveys for My Requests',
    description: 'Lists submitted or approved surveys for Customer own service requests. Draft surveys remain hidden.',
  })
  @ApiResponse({ status: 200, description: 'Surveys retrieved successfully.' })
  async getMySurveys(
    @CurrentUser('id') userId: string,
    @Query() query: QuerySurveyDto,
  ) {
    return this.surveysService.getCustomerSurveys(userId, query);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get Customer Read-Only Survey Inspection View' })
  @ApiParam({ name: 'id', description: 'Survey UUID' })
  @ApiResponse({ status: 200, description: 'Survey inspection details returned.' })
  @ApiResponse({ status: 403, description: 'Forbidden: Draft state or not your request.' })
  async getMySurveyById(
    @CurrentUser('id') userId: string,
    @Param('id') surveyId: string,
  ) {
    return this.surveysService.getCustomerSurveyById(userId, surveyId);
  }
}
