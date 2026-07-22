import { PartialType } from '@nestjs/swagger';
import { CreateSurveyItemDto } from './create-survey-item.dto';

export class UpdateSurveyItemDto extends PartialType(CreateSurveyItemDto) {}
