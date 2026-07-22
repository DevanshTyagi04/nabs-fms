import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { SurveySeverity } from '@prisma/client';
import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
  Min,
} from 'class-validator';

export class CreateSurveyItemDto {
  @ApiProperty({ example: 'Outdoor Compressor Unit', description: 'Inspection area or location' })
  @IsNotEmpty({ message: 'Area is required' })
  @IsString()
  @Length(2, 100)
  area!: string;

  @ApiProperty({ example: 'Fan Motor & Capacitor', description: 'Specific component or element inspected' })
  @IsNotEmpty({ message: 'Element is required' })
  @IsString()
  @Length(2, 100)
  element!: string;

  @ApiProperty({
    example: 'Capacitor shows bulging and electrical resistance is out of spec.',
    description: 'Detailed technical observation findings',
  })
  @IsNotEmpty({ message: 'Observation is required' })
  @IsString()
  @Length(5, 1000)
  observation!: string;

  @ApiPropertyOptional({
    example: 'Replace 45/5 MFD dual run capacitor and test fan motor current.',
    description: 'Recommended corrective action',
  })
  @IsOptional()
  @IsString()
  @Length(0, 500)
  actionRequired?: string;

  @ApiPropertyOptional({ enum: SurveySeverity, example: SurveySeverity.HIGH, description: 'Finding severity' })
  @IsOptional()
  @IsEnum(SurveySeverity)
  severity?: SurveySeverity;

  @ApiPropertyOptional({ example: 1, description: 'Display sort order (min 1)' })
  @IsOptional()
  @IsInt()
  @Min(1)
  sortOrder?: number;

  @ApiPropertyOptional({ example: true, description: 'Whether this item is mandatory for survey completion' })
  @IsOptional()
  @IsBoolean()
  isMandatory?: boolean;

  @ApiPropertyOptional({ example: true, description: 'Whether a photo attachment is required for this item' })
  @IsOptional()
  @IsBoolean()
  photoRequired?: boolean;
}
