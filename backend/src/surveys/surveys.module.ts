import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma';
import { StorageModule } from '../storage';
import { AdminSurveyController } from './admin-surveys.controller';
import { SurveyAttachmentService } from './attachment/survey-attachment.service';
import { CustomerSurveyController } from './customer-surveys.controller';
import { SurveyStateService } from './state/survey-state.service';
import { SurveysService } from './surveys.service';
import { VendorSurveyController } from './vendor-surveys.controller';

@Module({
  imports: [PrismaModule, StorageModule],
  controllers: [
    VendorSurveyController,
    AdminSurveyController,
    CustomerSurveyController,
  ],
  providers: [
    SurveysService,
    SurveyStateService,
    SurveyAttachmentService,
  ],
  exports: [
    SurveysService,
    SurveyStateService,
    SurveyAttachmentService,
  ],
})
export class SurveysModule {}
