import axios from 'axios';
import type { Airport } from '../types/notam';

/** Severidad opcional para filtros de NOTAM */
export type NotamSeverity = 'CRITICAL' | 'MAJOR' | 'MINOR';

/** Filtros soportados por /notams */
export type NotamFilters = {
  fir?: string;
  aerodrome?: string;
  qcode?: string[];
  severity?: NotamSeverity[];
  activeOnly?: boolean;
  search?: string;
  from?: string;
  to?: string;
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

export async function fetchAirports(): Promise<Airport[]> {
  const { data } = await api.get<Airport[]>('/airports');
  return data;
}

export async function fetchCatalogs(): Promise<unknown> {
  const { data } = await api.get('/catalogs');
  // acepta ambos formatos
  return (data && typeof data === 'object' && 'data' in data) ? (data as any).data : data;
}

export async function fetchNotams(params: NotamFilters): Promise<unknown> {
  const { data } = await api.get('/notams', { params });
  return data;
}

export async function createAirport(airport: Airport): Promise<Airport> {
  const { data } = await api.post<Airport>('/airports', airport);
  return data;
}
