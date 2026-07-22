import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Length } from 'class-validator';

export class AddInternalNoteDto {
  @ApiProperty({ example: 'Customer called confirming site gate access code is 4321.', description: 'Internal staff note content' })
  @IsNotEmpty({ message: 'Internal note comment is required' })
  @IsString()
  @Length(2, 500)
  comment!: string;
}
