import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsNumber, IsOptional, IsString, Length, Min } from 'class-validator';

export class CreateWorkTaskDto {
  @ApiProperty({ example: 'Isolate power & replace main compressor capacitor', description: 'Execution checklist task description' })
  @IsNotEmpty({ message: 'Task description is required' })
  @IsString()
  @Length(2, 250)
  description!: string;

  @ApiPropertyOptional({ example: 'Ensure safety lockouts are active.', description: 'Task remarks or safety notes' })
  @IsOptional()
  @IsString()
  @Length(0, 500)
  remarks?: string;

  @ApiPropertyOptional({ example: 1, description: 'Task execution sequence number' })
  @IsOptional()
  @IsInt()
  @Min(1)
  sequenceNumber?: number;

  @ApiPropertyOptional({ example: 1.5, description: 'Estimated execution hours' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  estimatedHours?: number;
}
