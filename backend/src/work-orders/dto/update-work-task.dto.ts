import { ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { TaskStatus } from '@prisma/client';
import { IsEnum, IsNumber, IsOptional, Min } from 'class-validator';
import { CreateWorkTaskDto } from './create-work-task.dto';

export class UpdateWorkTaskDto extends PartialType(CreateWorkTaskDto) {
  @ApiPropertyOptional({ enum: TaskStatus, example: TaskStatus.COMPLETED, description: 'Updated TaskStatus' })
  @IsOptional()
  @IsEnum(TaskStatus)
  status?: TaskStatus;

  @ApiPropertyOptional({ example: 1.5, description: 'Actual hours spent on task' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  actualHours?: number;
}
