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
  q_line?: string | null;
  subject: string | null;
  condition: string | null;
  modifier: string | null;
  text: string;
  start_at: string | null;
  end_at: string | null;
  coords_geojson?: {
    type: string;
    coordinates: [number, number];
    properties?: { radiusNm?: number };
  } | null;
  severity: number;
  relevance: number;
  category: string | null;
  element: string | null;
  services: string[];
  status: string;
  created_at?: string;
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
