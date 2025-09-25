import axios from 'axios';
import { Airport, Catalogs, Notam } from '../types/notam';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:3001',
});

export async function fetchAirports(): Promise<Airport[]> {
  const { data } = await api.get<{ data: Airport[] }>('/airports');
  return data.data;
}

export async function createAirport(payload: Airport): Promise<Airport> {
  const { data } = await api.post<{ data: Airport }>('/airports', payload);
  return data.data;
}

export async function fetchCatalogs(): Promise<Catalogs> {
  const { data } = await api.get<{ data: Catalogs }>('/catalogs');
  return data.data;
}

export interface NotamFilters {
  icao?: string;
  from?: string;
  to?: string;
  cat?: string;
  severity?: number;
  search?: string;
}

export async function fetchNotams(filters: NotamFilters): Promise<Notam[]> {
  const { data } = await api.get<{ data: Notam[] }>('/notams', { params: filters });
  return data.data;
}
