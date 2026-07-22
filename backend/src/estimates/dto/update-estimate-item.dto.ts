import { PartialType } from '@nestjs/swagger';
import { CreateEstimateItemDto } from './create-estimate-item.dto';

export class UpdateEstimateItemDto extends PartialType(CreateEstimateItemDto) {}
