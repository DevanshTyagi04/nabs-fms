import {
  Body,
  Controller,
  Get,
  Headers,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
  Req,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { CurrentUser, Public, Roles } from '../auth/decorators';
import { InitiatePaymentDto, QueryPaymentDto, VerifyPaymentDto } from './dto';
import { PaymentsService } from './payments.service';

@ApiTags('Payments (Customer)')
@Controller('customer/payments')
export class CustomerPaymentController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('initiate')
  @Roles(UserRole.CUSTOMER)
  @ApiBearerAuth('JWT-auth')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Initiate Payment Session for Verified Work Order',
    description:
      'Creates a new Payment transaction and generates a Razorpay Order ID (order_...). Collision-safe PAY-YYYYMMDD-XXXX format.',
  })
  @ApiResponse({ status: 201, description: 'Payment session initiated successfully.' })
  @ApiResponse({ status: 400, description: 'Service Request has no approved estimate or active payment exists.' })
  async initiatePayment(
    @CurrentUser('id') userId: string,
    @Body() dto: InitiatePaymentDto,
  ) {
    return this.paymentsService.initiatePaymentCustomer(userId, dto);
  }

  @Post('verify')
  @Roles(UserRole.CUSTOMER)
  @ApiBearerAuth('JWT-auth')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Verify Razorpay Signature & Complete Checkout (Idempotent)',
    description:
      'Verifies Razorpay HMAC SHA256 signature. On success, transitions payment status to SUCCESS and ServiceRequest to COMPLETED. Idempotently ignores duplicate verification requests.',
  })
  @ApiResponse({ status: 200, description: 'Payment verified and completed successfully.' })
  @ApiResponse({ status: 400, description: 'Signature verification failed.' })
  async verifyPayment(
    @CurrentUser('id') userId: string,
    @Body() dto: VerifyPaymentDto,
  ) {
    return this.paymentsService.verifyPaymentCustomer(userId, dto);
  }

  @Public()
  @Post('webhook')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Razorpay Webhook Endpoint for Asynchronous Payment Events',
    description:
      'Receives and verifies asynchronous Razorpay webhook events (x-razorpay-signature). Handles payment.captured and payment.failed idempotently.',
  })
  async handleWebhook(
    @Headers('x-razorpay-signature') signature: string,
    @Req() req: any,
  ) {
    const rawBody = req.rawBody ? req.rawBody.toString('utf-8') : JSON.stringify(req.body);
    return this.paymentsService.handleRazorpayWebhook(rawBody, signature || '');
  }

  @Get()
  @Roles(UserRole.CUSTOMER)
  @ApiBearerAuth('JWT-auth')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'List Customer Payments' })
  @ApiResponse({ status: 200, description: 'Customer payments retrieved successfully.' })
  async getMyPayments(
    @CurrentUser('id') userId: string,
    @Query() query: QueryPaymentDto,
  ) {
    return this.paymentsService.getCustomerPayments(userId, query);
  }

  @Get(':id')
  @Roles(UserRole.CUSTOMER)
  @ApiBearerAuth('JWT-auth')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get Customer Payment Receipt' })
  @ApiParam({ name: 'id', description: 'Payment UUID' })
  @ApiResponse({ status: 200, description: 'Payment receipt details returned.' })
  @ApiResponse({ status: 403, description: 'Forbidden: Not your payment.' })
  async getMyPaymentById(
    @CurrentUser('id') userId: string,
    @Param('id') paymentId: string,
  ) {
    return this.paymentsService.getCustomerPaymentById(userId, paymentId);
  }
}
