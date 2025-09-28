import { useEffect, useState } from 'react';
import { fetchCatalogs } from '../api/client';
import type { Catalogs } from '../types/notam';

let cachedCatalogs: Catalogs | null = null;
let pendingPromise: Promise<Catalogs> | null = null;

export function useCatalogs() {
  const [data, setData] = useState<Catalogs | null>(cachedCatalogs);
  const [loading, setLoading] = useState(!cachedCatalogs);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let active = true;
    if (!cachedCatalogs && !pendingPromise) {
      pendingPromise = fetchCatalogs();
    }

    pendingPromise
      ?.then((result) => {
        if (!active) return;
        cachedCatalogs = result;
        setData(result);
        setLoading(false);
      })
      .catch((err) => {
        if (!active) return;
        setError(err instanceof Error ? err : new Error('Error fetching catalogs'));
        setLoading(false);
        cachedCatalogs = null;
      });

    return () => {
      active = false;
    };
  }, []);

  const refresh = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchCatalogs();
      cachedCatalogs = result;
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Error fetching catalogs'));
    } finally {
      setLoading(false);
    }
  };

  return { data, loading, error, refresh };
}

export default useCatalogs;
