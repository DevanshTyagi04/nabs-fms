import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Length } from 'class-validator';

export class AddEstimateCommentDto {
  @ApiProperty({ example: 'Customer requested 5% additional commercial discount.', description: 'Review comment content' })
  @IsNotEmpty({ message: 'Comment content is required' })
  @IsString()
  @Length(2, 500)
  comment!: string;
}
