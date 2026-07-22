import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PaymentMethod } from '@prisma/client';
import { IsEnum, IsNotEmpty, IsOptional, IsString, Length } from 'class-validator';

export class ReconcilePaymentDto {
  @ApiProperty({ enum: PaymentMethod, example: PaymentMethod.CASH, description: 'Reconciled Payment Method' })
  @IsNotEmpty({ message: 'Payment method is required for reconciliation' })
  @IsEnum(PaymentMethod)
  paymentMethod!: PaymentMethod;

  @ApiPropertyOptional({ example: 'TXN-BANK-998877', description: 'External transaction or reference number' })
  @IsOptional()
  @IsString()
  gatewayTransactionId?: string;

  @ApiProperty({ example: 'Manual cash payment collected and verified on site', description: 'Reconciliation remarks' })
  @IsNotEmpty({ message: 'Reconciliation remarks are required' })
  @IsString()
  @Length(3, 500)
  remarks!: string;
}
