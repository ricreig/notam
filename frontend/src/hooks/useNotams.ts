import { useCallback, useEffect, useMemo, useState } from 'react';
import { fetchNotams, type NotamFilters } from '../api/client';
import type { Filters } from '../types/filters';
import type { Notam } from '../types/notam';

const ICAO_REGEX = /^[A-Z]{4}$/i;

interface UseNotamsOptions {
  applyStationFilter?: boolean;
}

function normalizeIso(value?: string | null) {
  if (!value) return undefined;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return undefined;
  return date.toISOString();
}

function buildQuery(filters: Filters, applyStationFilter: boolean): [NotamFilters, string | null] {
  const query: NotamFilters = {};

  if (filters.mode === 'RELATIVE') {
    const hours = filters.hours ?? 24;
    query.hours = hours;
  } else if (filters.mode === 'ABSOLUTE') {
    const fromIso = normalizeIso(filters.from ?? undefined);
    const toIso = normalizeIso(filters.to ?? undefined);
    if (fromIso) query.from = fromIso;
    if (toIso) query.to = toIso;
  } else if (filters.mode === 'DAILY') {
    const now = new Date();
    const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 0, 0, 0));
    const end = new Date(start);
    end.setUTCDate(end.getUTCDate() + 1);
    query.from = start.toISOString();
    query.to = end.toISOString();
  }

  if (filters.category && filters.category !== 'all') {
    query.cat = filters.category;
  }

  const trimmed = filters.stationQuery?.trim().toUpperCase() ?? '';
  const isIcao = ICAO_REGEX.test(trimmed);
  if (applyStationFilter && isIcao) {
    query.icao = trimmed;
  }

  return [query, isIcao ? trimmed : null];
}

export function useNotams(filters: Filters, options: UseNotamsOptions = {}) {
  const { applyStationFilter = true } = options;
  const [data, setData] = useState<Notam[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const [query, station] = useMemo(
    () => buildQuery(filters, applyStationFilter),
    [filters, applyStationFilter],
  );

  const queryKey = useMemo(() => JSON.stringify(query), [query]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchNotams(query);
      setData(Array.isArray(result) ? result : []);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Error fetching NOTAMs'));
    } finally {
      setLoading(false);
    }
  }, [queryKey, query]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const result = await fetchNotams(query);
        if (!cancelled) {
          setData(Array.isArray(result) ? result : []);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err : new Error('Error fetching NOTAMs'));
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [queryKey, query]);

  return { data, loading, error, refetch: fetchData, appliedQuery: query, appliedStation: station };
}

export default useNotams;
