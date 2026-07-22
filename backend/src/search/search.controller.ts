import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Query,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUser } from '../auth/decorators';
import { QuerySearchDto } from './dto';
import { SearchService } from './search.service';

@ApiTags('Search & Global Filtering')
@ApiBearerAuth('JWT-auth')
@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get('service-requests')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Global Search & Filter Service Requests' })
  @ApiResponse({ status: 200, description: 'Filtered service requests returned.' })
  async searchServiceRequests(
    @CurrentUser('id') userId: string,
    @Query() query: QuerySearchDto,
  ) {
    return this.searchService.searchServiceRequests(userId, query);
  }

  @Get('surveys')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Global Search & Filter Surveys' })
  @ApiResponse({ status: 200, description: 'Filtered surveys returned.' })
  async searchSurveys(
    @CurrentUser('id') userId: string,
    @Query() query: QuerySearchDto,
  ) {
    return this.searchService.searchSurveys(userId, query);
  }

  @Get('estimates')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Global Search & Filter Estimates' })
  @ApiResponse({ status: 200, description: 'Filtered estimates returned.' })
  async searchEstimates(
    @CurrentUser('id') userId: string,
    @Query() query: QuerySearchDto,
  ) {
    return this.searchService.searchEstimates(userId, query);
  }

  @Get('work-orders')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Global Search & Filter Work Orders' })
  @ApiResponse({ status: 200, description: 'Filtered work orders returned.' })
  async searchWorkOrders(
    @CurrentUser('id') userId: string,
    @Query() query: QuerySearchDto,
  ) {
    return this.searchService.searchWorkOrders(userId, query);
  }

  @Get('payments')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Global Search & Filter Payments' })
  @ApiResponse({ status: 200, description: 'Filtered payments returned.' })
  async searchPayments(
    @CurrentUser('id') userId: string,
    @Query() query: QuerySearchDto,
  ) {
    return this.searchService.searchPayments(userId, query);
  }

  @Get('invoices')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Global Search & Filter Invoices' })
  @ApiResponse({ status: 200, description: 'Filtered invoices returned.' })
  async searchInvoices(
    @CurrentUser('id') userId: string,
    @Query() query: QuerySearchDto,
  ) {
    return this.searchService.searchInvoices(userId, query);
  }

  @Get('notifications')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Global Search & Filter Notifications' })
  @ApiResponse({ status: 200, description: 'Filtered notifications returned.' })
  async searchNotifications(
    @CurrentUser('id') userId: string,
    @Query() query: QuerySearchDto,
  ) {
    return this.searchService.searchNotifications(userId, query);
  }
}
