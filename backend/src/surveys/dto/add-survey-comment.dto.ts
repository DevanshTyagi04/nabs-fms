import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Length } from 'class-validator';

export class AddSurveyCommentDto {
  @ApiProperty({ example: 'Please re-verify compressor amperage readings.', description: 'Review comment content' })
  @IsNotEmpty({ message: 'Comment content is required' })
  @IsString()
  @Length(2, 500)
  comment!: string;
}
