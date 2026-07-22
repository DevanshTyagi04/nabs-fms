import { ApiProperty } from '@nestjs/swagger';

export class QueueMetricsDto {
  @ApiProperty({ example: 'QUEUE_NOTIFICATION' })
  queueName!: string;

  @ApiProperty({ example: 0 })
  waiting!: number;

  @ApiProperty({ example: 0 })
  active!: number;

  @ApiProperty({ example: 12 })
  completed!: number;

  @ApiProperty({ example: 0 })
  failed!: number;

  @ApiProperty({ example: 0 })
  delayed!: number;

  @ApiProperty({ example: 12 })
  totalEnqueued!: number;
}
