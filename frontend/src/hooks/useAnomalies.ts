import { useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';
import { Anomaly } from '../types';

export const useAnomalies = () => {
  const [anomalies, setAnomalies] = useState<Anomaly[]>([]);
  const [unacknowledged, setUnacknowledged] = useState<Anomaly[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAnomalies = useCallback(async (limit?: number) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await api.getAnomalies(limit);
      setAnomalies(response.anomalies);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch anomalies');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchUnacknowledged = useCallback(async () => {
    try {
      const response = await api.getUnacknowledgedAnomalies();
      setUnacknowledged(response.anomalies);
    } catch (err: any) {
      console.error('Failed to fetch unacknowledged anomalies:', err);
    }
  }, []);

  const acknowledgeAnomaly = async (id: number) => {
    try {
      await api.acknowledgeAnomaly(id);

      // Update local state
      setAnomalies((prev) =>
        prev.map((a) => (a.id === id ? { ...a, acknowledged: true } : a))
      );
      setUnacknowledged((prev) => prev.filter((a) => a.id !== id));
    } catch (err: any) {
      throw new Error(err.message || 'Failed to acknowledge anomaly');
    }
  };

  const createAnomaly = async (data: {
    transaction_id?: number;
    anomaly_type: string;
    severity: 'low' | 'medium' | 'high';
    description?: string;
  }) => {
    try {
      await api.createAnomaly(data);
      await fetchAnomalies();
      await fetchUnacknowledged();
    } catch (err: any) {
      throw new Error(err.message || 'Failed to create anomaly');
    }
  };

  useEffect(() => {
    fetchAnomalies();
    fetchUnacknowledged();
  }, [fetchAnomalies, fetchUnacknowledged]);

  return {
    anomalies,
    unacknowledged,
    isLoading,
    error,
    fetchAnomalies,
    acknowledgeAnomaly,
    createAnomaly,
  };
};
