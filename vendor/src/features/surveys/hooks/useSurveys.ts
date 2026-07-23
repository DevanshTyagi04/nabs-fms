import { useState, useEffect } from 'react';
import { SurveyService } from '../api/SurveyService';
import { VendorSurvey } from '../api/SurveyRepository';

export function useSurveys() {
  const [surveys, setSurveys] = useState<VendorSurvey[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSurveys = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await SurveyService.getVendorSurveys();
      setSurveys(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch vendor surveys');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSurveys();
  }, []);

  const submitSurvey = async (id: string, rating: number, notes: string) => {
    await SurveyService.submitSurvey(id, rating, notes);
    fetchSurveys();
  };

  return { surveys, loading, error, refetch: fetchSurveys, submitSurvey };
}
