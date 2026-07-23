'use client';

import { useState, useEffect, useCallback } from 'react';
import { SurveyService } from '../api/SurveyService';
import { Survey, SurveyFilters, ReviewSurveyDto } from '../types';

export function useSurveys(initialFilters: SurveyFilters) {
  const [filters, setFilters] = useState<SurveyFilters>(initialFilters);
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSurveys = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await SurveyService.listSurveys(filters);
      setSurveys(res.items);
      setTotal(res.total);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch technical surveys');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchSurveys();
  }, [fetchSurveys]);

  return {
    surveys,
    total,
    loading,
    error,
    filters,
    setFilters,
    refetch: fetchSurveys,
  };
}

export function useSurvey(id: string | null) {
  const [survey, setSurvey] = useState<Survey | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setSurvey(null);
      return;
    }
    let isMounted = true;
    setLoading(true);
    SurveyService.getById(id)
      .then((data) => {
        if (isMounted) setSurvey(data);
      })
      .catch((err) => {
        if (isMounted) setError(err.message || 'Survey not found');
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });
    return () => {
      isMounted = false;
    };
  }, [id]);

  return { survey, loading, error };
}

export function useReviewSurvey() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reviewSurvey = async (id: string, dto: ReviewSurveyDto) => {
    setLoading(true);
    setError(null);
    try {
      const res = await SurveyService.reviewSurvey(id, dto);
      return res;
    } catch (err: any) {
      setError(err.message || 'Failed to submit survey review');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { reviewSurvey, loading, error };
}
