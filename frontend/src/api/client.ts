import axios from 'axios';
import type { Airport, Notam, Catalogs } from '../types/notam';

export type NotamFilters = {
  category?: string;
  hours?: number;
  from?: string;
  to?: string;
  icao?: string;
};

const API_BASE =
  import.meta?.env?.VITE_API_URL ||
  (typeof window !== 'undefined' ? (window as any).__API_URL__ : '') ||
  'https://notam-api-ctareig.fly.dev';

export const api = axios.create({
  baseURL: API_BASE,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
});

function unwrapData<T>(payload: unknown): T {
  if (payload && typeof payload === 'object' && 'data' in (payload as any)) {
    return (payload as any).data as T;
  }
  return payload as T;
}

export async function fetchAirports(): Promise<Airport[]> {
  const { data } = await api.get('/airports');
  return unwrapData<Airport[]>(data) ?? [];
}

export async function fetchCatalogs(): Promise<Catalogs> {
  const { data } = await api.get('/catalogs');
  return unwrapData<Catalogs>(data);
}

export async function fetchNotams(params: NotamFilters): Promise<Notam[]> {
  const { data } = await api.get('/notams', { params });
  return unwrapData<Notam[]>(data) ?? [];
}
