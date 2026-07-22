import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PaymentType } from '@prisma/client';
import { IsEnum, IsNotEmpty, IsOptional, IsUUID } from 'class-validator';

export class InitiatePaymentDto {
  @ApiProperty({ example: 's1234567-89ab-cdef-0123-456789abcdef', description: 'ServiceRequest UUID for payment' })
  @IsNotEmpty({ message: 'ServiceRequest ID is required' })
  @IsUUID('4', { message: 'Invalid ServiceRequest UUID' })
  serviceRequestId!: string;

  @ApiPropertyOptional({ enum: PaymentType, example: PaymentType.FINAL, description: 'Type of payment (FINAL, ADVANCE, MILESTONE)' })
  @IsOptional()
  @IsEnum(PaymentType)
  paymentType?: PaymentType = PaymentType.FINAL;
}
