import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma';
import { StorageModule } from '../storage';
import { AdminEstimateController } from './admin-estimates.controller';
import { PricingCalculatorService } from './calculation/pricing-calculator.service';
import { CustomerEstimateController } from './customer-estimates.controller';
import { EstimatesService } from './estimates.service';
import { EstimateStateService } from './state/estimate-state.service';
import { VendorEstimateController } from './vendor-estimates.controller';

@Module({
  imports: [PrismaModule, StorageModule],
  controllers: [
    VendorEstimateController,
    CustomerEstimateController,
    AdminEstimateController,
  ],
  providers: [
    EstimatesService,
    EstimateStateService,
    PricingCalculatorService,
  ],
  exports: [
    EstimatesService,
    EstimateStateService,
    PricingCalculatorService,
  ],
})
export class EstimatesModule {}
