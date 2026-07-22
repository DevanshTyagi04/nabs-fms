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
import { QueryPaymentDto, ReconcilePaymentDto } from './dto';
import { PaymentsService } from './payments.service';

@ApiTags('Payments (Admin)')
@ApiBearerAuth('JWT-auth')
@Roles(UserRole.ADMIN)
@Controller('admin/payments')
export class AdminPaymentController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'View All Platform Payments' })
  @ApiResponse({ status: 200, description: 'All payments retrieved successfully.' })
  async getAllPayments(@Query() query: QueryPaymentDto) {
    return this.paymentsService.getAllPaymentsAdmin(query);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get Comprehensive Payment Details for Admin' })
  @ApiParam({ name: 'id', description: 'Payment UUID' })
  @ApiResponse({ status: 200, description: 'Detailed payment context returned.' })
  @ApiResponse({ status: 404, description: 'Payment not found.' })
  async getPaymentById(@Param('id') paymentId: string) {
    return this.paymentsService.getPaymentByIdAdmin(paymentId);
  }

  @Post(':id/reconcile')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Admin Manual Payment Reconciliation',
    description:
      'Manually reconciles cash, bank transfer, or offline payments, marking status as SUCCESS or REFUNDED.',
  })
  @ApiParam({ name: 'id', description: 'Payment UUID' })
  @ApiResponse({ status: 200, description: 'Payment reconciled successfully.' })
  async reconcilePayment(
    @CurrentUser('id') adminUserId: string,
    @Param('id') paymentId: string,
    @Body() dto: ReconcilePaymentDto,
  ) {
    return this.paymentsService.reconcilePaymentAdmin(adminUserId, paymentId, dto);
  }
}
