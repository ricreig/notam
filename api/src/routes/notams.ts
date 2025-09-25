import { Router } from 'express';
import { z } from 'zod';
import { parseNotam } from '../services/notamParser';
import { listNotams, insertParsedNotam } from '../db/queries/notams';
import { elements } from '../catalogs/elements';

const router = Router();

const parseSchema = z.object({
  raw: z.string().min(10),
  overrideSeverity: z.number().optional(),
  overrideRelevance: z.number().optional(),
  services: z.array(z.string()).optional(),
  category: z.string().optional(),
  element: z.string().optional(),
});

const listSchema = z.object({
  icao: z.string().optional(),
  from: z.string().optional(),
  to: z.string().optional(),
  cat: z.string().optional(),
  severity: z.coerce.number().optional(),
  search: z.string().optional(),
});

router.get('/', async (req, res, next) => {
  try {
    const query = listSchema.parse(req.query);
    const rows = await listNotams({
      icao: query.icao,
      from: query.from,
      to: query.to,
      category: query.cat,
      severity: query.severity,
      search: query.search,
    });
    res.json({ data: rows });
  } catch (error) {
    next(error);
  }
});

router.post('/parse', async (req, res, next) => {
  try {
    const body = parseSchema.parse(req.body);
    const parsed = parseNotam(body.raw);

    const matchedElement = body.element ?? inferElement(parsed.subject ?? '', parsed.condition ?? '');

    const stored = await insertParsedNotam({
      ...parsed,
      category: body.category ?? matchCategoryFromElement(matchedElement),
      element: matchedElement,
      services: body.services ?? [],
      overrideSeverity: body.overrideSeverity ?? null,
      overrideRelevance: body.overrideRelevance ?? null,
    });

    res.status(201).json({ data: stored, parsed });
  } catch (error) {
    next(error);
  }
});

function inferElement(subject: string, condition: string) {
  const upper = `${subject} ${condition}`.toUpperCase();
  const match = elements.find((element) => element.matchers.some((keyword) => upper.includes(keyword)));
  return match?.id ?? null;
}

function matchCategoryFromElement(elementId: string | null) {
  if (!elementId) return null;
  const element = elements.find((item) => item.id === elementId);
  return element?.categoryId ?? null;
}

export default router;
