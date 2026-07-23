import { useState, useEffect } from 'react';
import { SurveyService } from '../api/SurveyService';
import { CustomerSurvey } from '../api/SurveyRepository';

export function useSurveys() {
  const [surveys, setSurveys] = useState<CustomerSurvey[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSurveys = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await SurveyService.getCustomerSurveys();
      setSurveys(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch customer surveys');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSurveys();
  }, []);

  return { surveys, loading, error, refetch: fetchSurveys };
}
