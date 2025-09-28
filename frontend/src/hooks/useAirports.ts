import { useEffect, useState } from 'react';
import { fetchAirports } from '../api/client';
import type { Airport } from '../types/notam';

let cachedAirports: Airport[] | null = null;
let pending: Promise<Airport[]> | null = null;

export function useAirports() {
  const [data, setData] = useState<Airport[]>(cachedAirports ?? []);
  const [loading, setLoading] = useState(!cachedAirports);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let active = true;
    if (!cachedAirports && !pending) {
      pending = fetchAirports();
    }
    pending
      ?.then((result) => {
        if (!active) return;
        cachedAirports = result;
        setData(result);
        setLoading(false);
      })
      .catch((err) => {
        if (!active) return;
        setError(err instanceof Error ? err : new Error('Error fetching airports'));
        setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const refresh = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchAirports();
      cachedAirports = result;
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Error fetching airports'));
    } finally {
      setLoading(false);
    }
  };

  return { data, loading, error, refresh };
}

export default useAirports;
