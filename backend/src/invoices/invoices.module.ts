import { Module } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { PrismaModule } from '../prisma';
import { StorageModule } from '../storage';
import { AdminInvoiceController } from './admin-invoices.controller';
import { CustomerInvoiceController } from './customer-invoices.controller';
import { InvoicesService } from './invoices.service';
import { InvoiceNumberService } from './numbering/invoice-number.service';
import { InvoicePdfService } from './pdf/invoice-pdf.service';
import { InvoiceStateService } from './state/invoice-state.service';

@Module({
  imports: [PrismaModule, StorageModule, EventEmitterModule],
  controllers: [CustomerInvoiceController, AdminInvoiceController],
  providers: [
    InvoicesService,
    InvoiceStateService,
    InvoiceNumberService,
    InvoicePdfService,
  ],
  exports: [
    InvoicesService,
    InvoiceStateService,
    InvoiceNumberService,
    InvoicePdfService,
  ],
})
export class InvoicesModule {}
