import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsUUID, Length } from 'class-validator';

export class AddWorkLogDto {
  @ApiProperty({ example: 'Main compressor capacitor replaced and tested under 15A load.', description: 'Progress note / log content' })
  @IsNotEmpty({ message: 'Log content is required' })
  @IsString()
  @Length(2, 500)
  comment!: string;

  @ApiPropertyOptional({ description: 'Optional WorkTask UUID to associate log directly with a specific task' })
  @IsOptional()
  @IsUUID('4')
  workTaskId?: string;
}
