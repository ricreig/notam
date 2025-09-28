import pool from "../db/pool";
import { categories } from "../catalogs/categories";
import { elements } from "../catalogs/elements";
import mexicoAirports from "../data/mexico_airports.json";
import mexicoNotams from "../data/mexico_notams.json";

// Helper functions to automatically classify NOTAMs.
/**
 * Infer the element ID for a NOTAM based on its subject and condition.
 * It scans the combined subject and condition strings for any of the
 * keywords defined in the elements catalog. If no match is found it returns null.
 */
function inferElement(subject: string | null, condition: string | null): string | null {
  const upper = `${subject ?? ""} ${condition ?? ""}`.toUpperCase();
  const match = elements.find((element) =>
    element.matchers.some((keyword) => upper.includes(keyword))
  );
  return match?.id ?? null;
}

/**
 * Given an element ID, return the corresponding category ID from the catalog.
 * Returns null when no element or matching category is found.
 */
function matchCategoryFromElement(elementId: string | null): string | null {
  if (!elementId) return null;
  const element = elements.find((item) => item.id === elementId);
  return element?.categoryId ?? null;
}

type AirportSeed = {
  icao: string;
  name: string;
  lat: number;
  lon: number;
  base: boolean;
};

type NotamSeed = {
  icao: string;
  number: string;
  q_line: string;
  subject: string | null;
  condition: string | null;
  modifier: string | null;
  text: string;
  start_at: string | null;
  end_at: string | null;
  lower_ft: number | null;
  upper_ft: number | null;
  coords_geojson: unknown;
  category: string | null;
  element: string | null;
  services: string[];
  severity: number;
  relevance: number;
  status: string;
};

async function main() {
  console.log("Seeding catalog tables");

  await pool.query(
    `CREATE TABLE IF NOT EXISTS catalog_categories (
       id TEXT PRIMARY KEY,
       label TEXT NOT NULL,
       color TEXT NOT NULL,
       code TEXT NOT NULL
     );`
  );

  await pool.query(
    `CREATE TABLE IF NOT EXISTS catalog_elements (
       id TEXT PRIMARY KEY,
       category_id TEXT NOT NULL REFERENCES catalog_categories(id),
       label TEXT NOT NULL,
       matchers TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[]
     );`
  );

  await pool.query("BEGIN");

  try {
    for (const c of categories) {
      await pool.query(
        `INSERT INTO catalog_categories (id,label,color,code)
         VALUES ($1,$2,$3,$4)
         ON CONFLICT (id) DO UPDATE
         SET label=EXCLUDED.label, color=EXCLUDED.color, code=EXCLUDED.code;`,
        [c.id, c.label, c.color, c.code]
      );
    }

    for (const e of elements) {
      await pool.query(
        `INSERT INTO catalog_elements (id,category_id,label,matchers)
         VALUES ($1,$2,$3,$4)
         ON CONFLICT (id) DO UPDATE
         SET category_id=EXCLUDED.category_id, label=EXCLUDED.label, matchers=EXCLUDED.matchers;`,
        [e.id, e.categoryId, e.label, e.matchers]
      );
    }

    console.log("Upserting Mexico FIR airports");
    for (const airport of mexicoAirports as AirportSeed[]) {
      await pool.query(
        `INSERT INTO airports (icao, name, lat, lon, base)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (icao) DO UPDATE
         SET name = EXCLUDED.name,
             lat = EXCLUDED.lat,
             lon = EXCLUDED.lon,
             base = EXCLUDED.base;`,
        [airport.icao.toUpperCase(), airport.name, airport.lat, airport.lon, airport.base]
      );
    }

    console.log("Upserting FIR and airport NOTAMs");
    for (const notam of mexicoNotams as NotamSeed[]) {
      // Automatically infer element and category if they are not provided.
      // The seed data may not include these fields; classification here improves filtering.
      const inferredElement = inferElement(notam.subject ?? null, notam.condition ?? null);
      const inferredCategory = matchCategoryFromElement(inferredElement);

      // Prefer existing element/category if present in the seed, otherwise use inferred values
      const finalElement = notam.element ?? inferredElement;
      const finalCategory = notam.category ?? inferredCategory;

      await pool.query(
        `INSERT INTO notams (
           icao,
           number,
           q_line,
           subject,
           condition,
           modifier,
           text,
           start_at,
           end_at,
           lower_ft,
           upper_ft,
           coords_geojson,
           category,
           element,
           services,
           severity,
           relevance,
           status
         ) VALUES (
           $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18
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
           status = EXCLUDED.status;`,
        [
          notam.icao.toUpperCase(),
          notam.number,
          notam.q_line,
          notam.subject,
          notam.condition,
          notam.modifier,
          notam.text,
          notam.start_at ? new Date(notam.start_at) : null,
          notam.end_at ? new Date(notam.end_at) : null,
          notam.lower_ft,
          notam.upper_ft,
          notam.coords_geojson ? JSON.stringify(notam.coords_geojson) : null,
          finalCategory,
          finalElement,
          notam.services,
          notam.severity,
          notam.relevance,
          notam.status
        ]
      );
    }

    await pool.query("COMMIT");
    console.log("Seed complete");
  } catch (err) {
    await pool.query("ROLLBACK");
    throw err;
  } finally {
    await pool.end();
  }
}

main().catch(err => {
  console.error("Seed failed", err);
  process.exit(1);
});
