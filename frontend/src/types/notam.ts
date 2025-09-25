export interface Airport {
  icao: string;
  name: string;
  lat: number;
  lon: number;
  base: boolean;
}

export interface Notam {
  id: string;
  icao: string;
  number: string;
  subject: string | null;
  condition: string | null;
  modifier: string | null;
  text: string;
  start_at: string | null;
  end_at: string | null;
  severity: number;
  relevance: number;
  category: string | null;
  element: string | null;
  services: string[];
  status: string;
}

export interface Catalogs {
  categories: {
    id: string;
    label: string;
    color: string;
    code: string;
  }[];
  elements: {
    id: string;
    categoryId: string;
    label: string;
    matchers: string[];
  }[];
  severityColors: Record<string, string>;
}
