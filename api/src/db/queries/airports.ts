import pool from '../pool';

export interface AirportRow {
  icao: string;
  name: string;
  lat: number;
  lon: number;
  base: boolean;
  created_at?: Date;
}

export async function listAirports(): Promise<AirportRow[]> {
  const result = await pool.query('SELECT icao, name, lat, lon, base, created_at FROM airports ORDER BY icao ASC');
  return result.rows;
}

export async function insertAirport(row: AirportRow): Promise<AirportRow> {
  const query = `
    INSERT INTO airports (icao, name, lat, lon, base)
    VALUES ($1, $2, $3, $4, $5)
    ON CONFLICT (icao) DO UPDATE SET name = EXCLUDED.name, lat = EXCLUDED.lat, lon = EXCLUDED.lon, base = EXCLUDED.base
    RETURNING icao, name, lat, lon, base, created_at;
  `;
  const values = [row.icao.toUpperCase(), row.name, row.lat, row.lon, row.base];
  const result = await pool.query(query, values);
  return result.rows[0];
}

export async function deleteAirport(icao: string): Promise<void> {
  await pool.query('DELETE FROM airports WHERE icao = $1', [icao.toUpperCase()]);
}
