import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PaymentMethod } from '@prisma/client';
import { IsEnum, IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class VerifyPaymentDto {
  @ApiProperty({ example: 'p1234567-89ab-cdef-0123-456789abcdef', description: 'Internal Payment UUID' })
  @IsNotEmpty({ message: 'Payment ID is required' })
  @IsUUID('4', { message: 'Invalid Payment UUID' })
  paymentId!: string;

  @ApiProperty({ example: 'order_LMN123456789', description: 'Razorpay Gateway Order ID' })
  @IsNotEmpty({ message: 'Gateway Order ID is required' })
  @IsString()
  gatewayOrderId!: string;

  @ApiProperty({ example: 'pay_XYZ987654321', description: 'Razorpay Gateway Payment ID' })
  @IsNotEmpty({ message: 'Gateway Payment ID is required' })
  @IsString()
  gatewayPaymentId!: string;

  @ApiProperty({ example: 'a1b2c3d4e5f67890abcdef...', description: 'Razorpay HMAC SHA256 Signature' })
  @IsNotEmpty({ message: 'Gateway Signature is required' })
  @IsString()
  gatewaySignature!: string;

  @ApiPropertyOptional({ enum: PaymentMethod, example: PaymentMethod.CARD, description: 'Payment method used at checkout' })
  @IsOptional()
  @IsEnum(PaymentMethod)
  paymentMethod?: PaymentMethod;
}
