import { useState, useEffect } from 'react';
import { ReportsService } from '../api/ReportsService';
import { CustomerReportMetrics } from '../api/ReportsRepository';

export function useReports() {
  const [data, setData] = useState<CustomerReportMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    ReportsService.getCustomerDashboard()
      .then((res) => {
        if (isMounted) setData(res);
      })
      .catch((err) => {
        if (isMounted) setError(err.message || 'Failed to fetch customer summary metrics');
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  return { data, loading, error };
}
