export type NotamStatus = 'ACTIVE' | 'UPCOMING' | 'EXPIRED' | 'PERMANENT';

export interface ParsedNotam {
  icao: string;
  number: string;
  qLine: string | null;
  fir: string | null;
  traffic: string | null;
  purpose: string | null;
  scope: string | null;
  lowerLimitFt: number | null;
  upperLimitFt: number | null;
  coords: {
    lat: number;
    lon: number;
    radiusNm?: number;
  } | null;
  startAt: string | null;
  endAt: string | null;
  schedule?: string | null;
  subject: string | null;
  condition: string | null;
  modifier: string | null;
  text: string;
  references?: string[];
  status: NotamStatus;
  estimated?: boolean;
  permanent?: boolean;
}

export interface CatalogCategory {
  id: string;
  label: string;
  color: string;
  code: string;
}

export interface CatalogElement {
  id: string;
  categoryId: string;
  label: string;
  matchers: string[];
}

export interface SeverityBreakdown {
  severity: number;
  relevance: number;
  reasons: string[];
}
