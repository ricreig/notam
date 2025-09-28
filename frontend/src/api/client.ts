import axios from 'axios';
import type { Airport, Catalogs, Notam } from '../types/notam';

const BASE = (import.meta.env.VITE_API_URL ?? 'https://notam-api-ctareig.fly.dev').replace(/\/+$/,'');
const api = axios.create({ baseURL: BASE, timeout: 10000 });

const asArray = (v:any) => Array.isArray(v) ? v : Array.isArray(v?.data) ? v.data : [];

export async function fetchAirports(): Promise<Airport[]> {
  const { data } = await api.get('/airports');
  return asArray(data);
}

export async function fetchCatalogs(): Promise<Catalogs | Record<string, unknown>> {
  const { data } = await api.get('/catalogs');
  return data ?? {};
}

export type NotamFilters = Record<string, any>;
export async function fetchNotams(params: NotamFilters = {}): Promise<Notam[]> {
  const { data } = await api.get('/notams', { params });
  return asArray(data);
}

export async function createAirport(a: Airport): Promise<Airport> {
  const { data } = await api.post('/airports', a);
  return data;
}
