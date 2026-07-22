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
import { QueryInvoiceDto } from './dto';
import { InvoicesService } from './invoices.service';

@ApiTags('Invoices (Customer)')
@ApiBearerAuth('JWT-auth')
@Roles(UserRole.CUSTOMER)
@Controller('customer/invoices')
export class CustomerInvoiceController {
  constructor(private readonly invoicesService: InvoicesService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'List Customer Invoices' })
  @ApiResponse({ status: 200, description: 'Customer invoices retrieved successfully.' })
  async getMyInvoices(
    @CurrentUser('id') userId: string,
    @Query() query: QueryInvoiceDto,
  ) {
    return this.invoicesService.getCustomerInvoices(userId, query);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get Customer Invoice Details' })
  @ApiParam({ name: 'id', description: 'Invoice UUID' })
  @ApiResponse({ status: 200, description: 'Invoice details returned.' })
  @ApiResponse({ status: 403, description: 'Forbidden: Not your invoice.' })
  async getMyInvoiceById(
    @CurrentUser('id') userId: string,
    @Param('id') invoiceId: string,
  ) {
    return this.invoicesService.getCustomerInvoiceById(userId, invoiceId);
  }

  @Get(':id/download')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Download Customer Invoice PDF Document' })
  @ApiParam({ name: 'id', description: 'Invoice UUID' })
  @ApiResponse({ status: 200, description: 'Invoice PDF download link returned.' })
  async downloadInvoicePdf(
    @CurrentUser('id') userId: string,
    @Param('id') invoiceId: string,
  ) {
    return this.invoicesService.downloadInvoicePdfCustomer(userId, invoiceId);
  }
}
