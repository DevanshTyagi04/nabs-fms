import { useState, useEffect } from 'react';
import { ReportsService } from '../api/ReportsService';
import { VendorReportMetrics } from '../api/ReportsRepository';

export function useReports() {
  const [data, setData] = useState<VendorReportMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    ReportsService.getVendorDashboard()
      .then((res) => {
        if (isMounted) setData(res);
      })
      .catch((err) => {
        if (isMounted) setError(err.message || 'Failed to fetch vendor performance metrics');
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
