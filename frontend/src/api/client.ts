import axios from 'axios';

const API_BASE =
  import.meta?.env?.VITE_API_URL ||
  (typeof window !== 'undefined' ? (window as any).__API_URL__ : '') ||
  'https://notam-api-ctareig.fly.dev';

const api = axios.create({
  baseURL: API_BASE,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
});

export async function fetchAirports() {
  const { data } = await api.get('/airports');
  return data;
}

export async function fetchCatalogs() {
  const { data } = await api.get('/catalogs');
  return data;
}

export async function fetchNotams(params: Record<string, any>) {
  const { data } = await api.get('/notams', { params });
  return data;
}

export async function createAirport(airport: {
  icao: string; name: string; lat: number; lon: number; base?: boolean;
}) {
  const { data } = await api.post('/airports', airport);
  return data;
}
