import { SurveyRepository } from './SurveyRepository';
import { Survey, SurveyFilters, SurveyListResult, ReviewSurveyDto } from '../types';

export class SurveyService {
  static async listSurveys(filters: SurveyFilters): Promise<SurveyListResult> {
    return SurveyRepository.listSurveys(filters);
  }

  static async getById(id: string): Promise<Survey | null> {
    return SurveyRepository.getById(id);
  }

  static async reviewSurvey(id: string, dto: ReviewSurveyDto): Promise<Survey> {
    if (!dto.status) throw new Error('Review decision (APPROVED or REJECTED) is required');
    return SurveyRepository.reviewSurvey(id, dto);
  }
}
