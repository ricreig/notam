// Tipos compartidos para filtros de NOTAM
export type NotamSeverity = 'CRITICAL' | 'MAJOR' | 'MINOR';

export type NotamFilters = {
  fir?: string;                 // p.ej. "MMFR", "MMFO"
  aerodrome?: string;           // p.ej. "MMTJ"
  qcode?: string[];             // p.ej. ["QMRLC","QMNCS"]
  severity?: NotamSeverity[];   // opcional: múltiple
  activeOnly?: boolean;         // true = solo vigentes
  search?: string;              // full-text
  from?: string;                // ISO 8601
  to?: string;                  // ISO 8601
};
