import { useState, useEffect, useCallback } from 'react';
import { surveysApi } from '@/lib/surveys-api';
import { SurveyDetail } from '@/lib/types/surveys.types';
import { SurveySummary } from '@/lib/types/service-requests.types';

export function useSurveyDetails(surveyId: string) {
  const [survey, setSurvey] = useState<SurveyDetail | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isError, setIsError] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');

  const fetchSurvey = useCallback(async () => {
    if (!surveyId) return;
    setIsLoading(true);
    setIsError(false);
    setErrorMessage('');
    try {
      const data = await surveysApi.getSurveyById(surveyId);
      setSurvey(data);
    } catch (err: any) {
      setIsError(true);
      setErrorMessage(
        err?.response?.data?.message || err?.message || 'Failed to load survey details.'
      );
    } finally {
      setIsLoading(false);
    }
  }, [surveyId]);

  useEffect(() => {
    fetchSurvey();
  }, [fetchSurvey]);

  return {
    survey,
    isLoading,
    isError,
    errorMessage,
    refetch: fetchSurvey,
  };
}

export function useSurveyVersions(serviceRequestId: string | undefined, enabled: boolean) {
  const [versions, setVersions] = useState<SurveySummary[]>([]);
  const [isLoadingVersions, setIsLoadingVersions] = useState<boolean>(false);

  const fetchVersions = useCallback(async () => {
    if (!serviceRequestId) return;
    setIsLoadingVersions(true);
    try {
      const data = await surveysApi.getSurveysByRequestId(serviceRequestId);
      setVersions(data);
    } catch {
      setVersions([]);
    } finally {
      setIsLoadingVersions(false);
    }
  }, [serviceRequestId]);

  useEffect(() => {
    if (enabled && serviceRequestId) {
      fetchVersions();
    }
  }, [enabled, serviceRequestId, fetchVersions]);

  return {
    versions,
    isLoadingVersions,
    refetchVersions: fetchVersions,
  };
}
