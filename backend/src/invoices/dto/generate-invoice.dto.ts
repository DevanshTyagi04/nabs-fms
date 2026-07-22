import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsNotEmpty, IsOptional, IsUUID } from 'class-validator';

export class GenerateInvoiceDto {
  @ApiProperty({ example: 'p1234567-89ab-cdef-0123-456789abcdef', description: 'Successful Payment UUID' })
  @IsNotEmpty({ message: 'Payment ID is required' })
  @IsUUID('4', { message: 'Invalid Payment UUID' })
  paymentId!: string;

  @ApiPropertyOptional({ example: '2026-08-20T00:00:00Z', description: 'Optional payment due date' })
  @IsOptional()
  @IsDateString({}, { message: 'dueDate must be a valid ISO 8601 date string' })
  dueDate?: string;
}
