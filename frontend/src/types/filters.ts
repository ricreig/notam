export type TimeMode = 'RELATIVE' | 'ABSOLUTE' | 'DAILY';

export interface Filters {
  mode: TimeMode;
  hours?: number;
  from?: string | null;
  to?: string | null;
  category?: string | 'all';
  stationQuery?: string;
}

export const RELATIVE_HOURS_OPTIONS = [2, 6, 12, 24, 48, 72, 168] as const;

export const DEFAULT_FILTERS: Filters = {
  mode: 'RELATIVE',
  hours: 24,
  category: 'all',
  stationQuery: '',
};
