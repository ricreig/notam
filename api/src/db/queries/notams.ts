import pool from '../pool';
import { ParsedNotam } from '../../types';
import { computeScore } from '../../services/scoring';

export interface NotamFilters {
  icao?: string;
  from?: string;
  to?: string;
  category?: string;
  severity?: number;
  search?: string;
}

export async function listNotams(filters: NotamFilters) {
  const clauses: string[] = [];
  const values: unknown[] = [];

  if (filters.icao) {
    values.push(filters.icao.toUpperCase());
    clauses.push(`icao = $${values.length}`);
  }

  if (filters.from) {
    values.push(filters.from);
    clauses.push(`start_at >= $${values.length}`);
  }

  if (filters.to) {
    values.push(filters.to);
    clauses.push(`end_at <= $${values.length}`);
  }

  if (filters.category) {
    values.push(filters.category);
    clauses.push(`category = $${values.length}`);
  }

  if (filters.severity) {
    values.push(filters.severity);
    clauses.push(`severity >= $${values.length}`);
  }

  if (filters.search) {
    values.push(`%${filters.search.toUpperCase()}%`);
    clauses.push(`(UPPER(text) LIKE $${values.length} OR number ILIKE $${values.length})`);
  }

  const whereClause = clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';
  const query = `
    SELECT * FROM notams
    ${whereClause}
    ORDER BY start_at DESC NULLS LAST
    LIMIT 500;
  `;

  const result = await pool.query(query, values);
  return result.rows;
}

export async function insertParsedNotam(parsed: ParsedNotam & { category?: string | null; element?: string | null; services?: string[]; overrideSeverity?: number | null; overrideRelevance?: number | null; }) {
  const baseRow = {
    icao: parsed.icao,
    number: parsed.number,
    q_line: parsed.qLine,
    subject: parsed.subject,
    condition: parsed.condition,
    modifier: parsed.modifier,
    text: parsed.text,
    start_at: parsed.startAt,
    end_at: parsed.endAt,
    lower_ft: parsed.lowerLimitFt,
    upper_ft: parsed.upperLimitFt,
    coords_geojson: parsed.coords
      ? {
          type: 'Point',
          coordinates: [parsed.coords.lon, parsed.coords.lat],
          properties: { radiusNm: parsed.coords.radiusNm },
        }
      : null,
    category: parsed.category ?? null,
    element: parsed.element ?? null,
    services: parsed.services ?? [],
    status: parsed.status,
  };

  const scores = computeScore({
    category: parsed.category ?? undefined,
    element: parsed.element ?? undefined,
    subject: parsed.subject ?? undefined,
    condition: parsed.condition ?? undefined,
    modifier: parsed.modifier ?? undefined,
    startAt: parsed.startAt ?? undefined,
    endAt: parsed.endAt ?? undefined,
    services: parsed.services,
    baseAirport: false,
    status: parsed.status,
  });

  const severity = parsed.overrideSeverity ?? scores.severity;
  const relevance = parsed.overrideRelevance ?? scores.relevance;

  const insertQuery = `
    INSERT INTO notams (
      icao, number, q_line, subject, condition, modifier, text, start_at, end_at,
      lower_ft, upper_ft, coords_geojson, category, element, services, severity,
      relevance, status
    ) VALUES (
      $1,$2,$3,$4,$5,$6,$7,$8,$9,
      $10,$11,$12,$13,$14,$15,$16,$17,$18
    )
    ON CONFLICT (number, icao) DO UPDATE SET
      q_line = EXCLUDED.q_line,
      subject = EXCLUDED.subject,
      condition = EXCLUDED.condition,
      modifier = EXCLUDED.modifier,
      text = EXCLUDED.text,
      start_at = EXCLUDED.start_at,
      end_at = EXCLUDED.end_at,
      lower_ft = EXCLUDED.lower_ft,
      upper_ft = EXCLUDED.upper_ft,
      coords_geojson = EXCLUDED.coords_geojson,
      category = EXCLUDED.category,
      element = EXCLUDED.element,
      services = EXCLUDED.services,
      severity = EXCLUDED.severity,
      relevance = EXCLUDED.relevance,
      status = EXCLUDED.status
    RETURNING *;
  `;

  const values = [
    baseRow.icao,
    baseRow.number,
    baseRow.q_line,
    baseRow.subject,
    baseRow.condition,
    baseRow.modifier,
    baseRow.text,
    baseRow.start_at,
    baseRow.end_at,
    baseRow.lower_ft,
    baseRow.upper_ft,
    baseRow.coords_geojson,
    baseRow.category,
    baseRow.element,
    baseRow.services ?? [],
    severity,
    relevance,
    baseRow.status,
  ];

  const result = await pool.query(insertQuery, values);
  return result.rows[0];
}
