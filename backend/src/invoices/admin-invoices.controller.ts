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
import { GenerateInvoiceDto, QueryInvoiceDto } from './dto';
import { InvoicesService } from './invoices.service';

@ApiTags('Invoices (Admin)')
@ApiBearerAuth('JWT-auth')
@Roles(UserRole.ADMIN)
@Controller('admin/invoices')
export class AdminInvoiceController {
  constructor(private readonly invoicesService: InvoicesService) {}

  @Post('generate')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Generate Invoice for Successful Payment (Idempotent)',
    description:
      'Creates a new Invoice record for a successful payment. Generates collision-safe INV-YYYYMMDD-XXXX number and PDF document. Returns existing invoice if already generated.',
  })
  @ApiResponse({ status: 201, description: 'Invoice generated successfully.' })
  @ApiResponse({ status: 400, description: 'Payment is not in SUCCESS status.' })
  async generateInvoice(
    @CurrentUser('id') adminUserId: string,
    @Body() dto: GenerateInvoiceDto,
  ) {
    return this.invoicesService.generateInvoiceForPayment(adminUserId, dto);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'View All Platform Invoices' })
  @ApiResponse({ status: 200, description: 'All invoices retrieved successfully.' })
  async getAllInvoices(@Query() query: QueryInvoiceDto) {
    return this.invoicesService.getAllInvoicesAdmin(query);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get Comprehensive Invoice Details for Admin' })
  @ApiParam({ name: 'id', description: 'Invoice UUID' })
  @ApiResponse({ status: 200, description: 'Detailed invoice context returned.' })
  @ApiResponse({ status: 404, description: 'Invoice record not found.' })
  async getInvoiceById(@Param('id') invoiceId: string) {
    return this.invoicesService.getInvoiceByIdAdmin(invoiceId);
  }

  @Post(':id/cancel')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Cancel Invoice' })
  @ApiParam({ name: 'id', description: 'Invoice UUID' })
  @ApiResponse({ status: 200, description: 'Invoice cancelled successfully.' })
  async cancelInvoice(
    @CurrentUser('id') adminUserId: string,
    @Param('id') invoiceId: string,
    @Body('reason') reason?: string,
  ) {
    return this.invoicesService.cancelInvoiceAdmin(adminUserId, invoiceId, reason);
  }

  @Post(':id/regenerate-pdf')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Regenerate Invoice PDF Document' })
  @ApiParam({ name: 'id', description: 'Invoice UUID' })
  @ApiResponse({ status: 200, description: 'PDF document regenerated successfully.' })
  async regeneratePdf(
    @CurrentUser('id') adminUserId: string,
    @Param('id') invoiceId: string,
  ) {
    return this.invoicesService.regeneratePdfAdmin(adminUserId, invoiceId);
  }
}
