import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Length } from 'class-validator';

export class PauseWorkOrderDto {
  @ApiProperty({
    example: 'Awaiting OEM replacement fan blades delivery. Site secured.',
    description: 'Reason for putting work order on hold',
  })
  @IsNotEmpty({ message: 'Pause reason is required' })
  @IsString()
  @Length(3, 500)
  reason!: string;
}
