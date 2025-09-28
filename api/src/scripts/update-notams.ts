// api/src/scripts/update-notams.ts
import 'dotenv/config';
import pool from '../db/pool';
import { parseNotam } from '../services/notamParser';
import { insertParsedNotam } from '../db/queries/notams';
import { elements } from '../catalogs/elements';

/** Clasificación */
function inferElement(subject: string | null, condition: string | null): string | null {
  const upper = `${subject ?? ''} ${condition ?? ''}`.toUpperCase();
  const match = elements.find((el) => el.matchers.some((kw) => upper.includes(kw)));
  return match?.id ?? null;
}
function matchCategoryFromElement(elementId: string | null): string | null {
  if (!elementId) return null;
  const el = elements.find((e) => e.id === elementId);
  return el?.categoryId ?? null;
}

/** Fallbacks E) */
function extractE(raw: string): string | null {
  const m = raw.match(/\bE\)\s*(.+)$/i);
  return m ? m[1].trim().replace(/\)+$/, '').trim() : null;
}
function inferConditionFromE(e: string | null): string | null {
  if (!e) return null;
  const KWS = ['CLOSED','UNSERVICEABLE','U/S','WIP','WORK IN PROGRESS','ACT','SUSPENDED','AVBL','UNAVBL'];
  const hit = KWS.find((k) => e.toUpperCase().includes(k));
  return hit ?? null;
}
function labelFromE(e: string | null, max = 48): string | null {
  if (!e) return null;
  return e.length > max ? e.slice(0, max).trim() + '…' : e;
}

/** Feed */
type FeedItem = {
  raw: string;
  services?: string[];
  overrideSeverity?: number | null;
  overrideRelevance?: number | null;
  category?: string | null;
  element?: string | null;
};
async function fetchLiveNotams(): Promise<FeedItem[]> {
  const url = process.env.LIVE_NOTAM_FEED_URL;
  if (!url) throw new Error('Environment variable LIVE_NOTAM_FEED_URL is not defined');
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch NOTAM feed: ${res.status} ${res.statusText}`);
  const data = await res.json();
  if (!Array.isArray(data)) throw new Error('NOTAM feed did not return an array');
  return data.map((entry: any): FeedItem => {
    if (typeof entry === 'string') return { raw: entry };
    if (entry && typeof entry.raw === 'string') {
      return {
        raw: entry.raw,
        services: Array.isArray(entry.services) ? entry.services : undefined,
        overrideSeverity: typeof entry.overrideSeverity === 'number' ? entry.overrideSeverity : null,
        overrideRelevance: typeof entry.overrideRelevance === 'number' ? entry.overrideRelevance : null,
        category: typeof entry.category === 'string' ? entry.category : null,
        element: typeof entry.element === 'string' ? entry.element : null,
      };
    }
    throw new Error('Invalid entry in NOTAM feed (must be string or {raw:string,...})');
  });
}

/** Export: importador invocable por webhook */
export async function runImport() {
  const items = await fetchLiveNotams();
  let ok = 0, skip = 0;

  for (const entry of items) {
    try {
      const raw = (entry.raw || '').replace(/\r\n?/g, '\n').trim();
      if (!raw.startsWith('(')) { skip++; continue; }
      if (!/\([A-Z]\d{4}\/\d{2}/i.test(raw)) { skip++; continue; }

      const parsed = parseNotam(raw);

      // ICAO/FIR: parser → FIR → A)
      let icao = (parsed.icao ?? '').trim() || (parsed.fir ?? '').trim();
      if (!icao) {
        const mA = raw.match(/\nA\)\s*([A-Z0-9]{4})/i);
        if (mA) icao = mA[1].toUpperCase();
      }
      if (!icao) { skip++; continue; }

      // Asegura airport/FIR
      await pool.query(
        `INSERT INTO airports (icao, name, lat, lon, base)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (icao) DO NOTHING;`,
        [icao, `${icao} (FIR)`, 23.0, -102.0, false]
      );

      // Fallbacks visibles
      const eText = extractE(raw);
      const subjectSafe   = parsed.subject?.trim()   || labelFromE(eText) || null;
      const conditionSafe = parsed.condition?.trim() || inferConditionFromE(eText) || null;
      const textSafe      = parsed.text?.trim()      || eText || raw;

      // Clasificación
      const elementId  = entry.element  ?? inferElement(subjectSafe, conditionSafe);
      const categoryId = entry.category ?? matchCategoryFromElement(elementId);

      await insertParsedNotam({
        ...parsed,
        icao,
        subject: subjectSafe,
        condition: conditionSafe,
        text: textSafe,
        category: categoryId,
        element: elementId,
        services: entry.services ?? [],
        overrideSeverity: entry.overrideSeverity ?? null,
        overrideRelevance: entry.overrideRelevance ?? null,
      });

      ok++;
    } catch {
      skip++;
    }
  }

  return { ok, skip, total: items.length };
}

/** CLI opcional (node dist/scripts/update-notams.js) */
async function main() {
  try {
    const r = await runImport();
    console.log(`NOTAM import completed. ok=${r.ok} skip=${r.skip} total=${r.total}`);
  } catch (err) {
    console.error('Error importing NOTAMs:', err);
    process.exit(1);
  }
}
if (require.main === module) { main(); }
