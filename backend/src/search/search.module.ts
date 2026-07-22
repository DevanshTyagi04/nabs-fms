import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma';
import { FilterBuilderService } from './filters/filter-builder.service';
import { PaginationService } from './pagination/pagination.service';
import { SearchController } from './search.controller';
import { SearchService } from './search.service';
import { SortingService } from './sorting/sorting.service';

@Module({
  imports: [PrismaModule],
  controllers: [SearchController],
  providers: [
    SearchService,
    FilterBuilderService,
    SortingService,
    PaginationService,
  ],
  exports: [
    SearchService,
    FilterBuilderService,
    SortingService,
    PaginationService,
  ],
})
export class SearchModule {}
