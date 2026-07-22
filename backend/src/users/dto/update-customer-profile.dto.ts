import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, Length } from 'class-validator';

export class UpdateCustomerProfileDto {
  @ApiPropertyOptional({ example: 'John', description: 'Customer first name' })
  @IsOptional()
  @IsString()
  @Length(2, 50)
  firstName?: string;

  @ApiPropertyOptional({ example: 'Doe', description: 'Customer last name' })
  @IsOptional()
  @IsString()
  @Length(2, 50)
  lastName?: string;

  @ApiPropertyOptional({ example: 'Acme Services LLC', description: 'Optional company name' })
  @IsOptional()
  @IsString()
  @Length(2, 100)
  companyName?: string;
}
