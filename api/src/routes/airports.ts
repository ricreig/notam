import { Router } from 'express';
import { z } from 'zod';
import { deleteAirport, insertAirport, listAirports } from '../db/queries/airports';

const router = Router();

const airportSchema = z.object({
  icao: z.string().trim().regex(/^[A-Z]{4}$/i, 'ICAO inválido').transform((v) => v.toUpperCase()),
  name: z.string().min(3),
  lat: z.number(),
  lon: z.number(),
  base: z.boolean().default(false),
});

router.get('/', async (_req, res, next) => {
  try {
    const airports = await listAirports();
    res.json({ data: airports });
  } catch (error) {
    next(error);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const body = airportSchema.parse(req.body);
    const airport = await insertAirport(body);
    res.status(201).json({ data: airport });
  } catch (error) {
    next(error);
  }
});

router.delete('/:icao', async (req, res, next) => {
  try {
    const icao = req.params.icao?.toUpperCase();
    if (!icao || !/^\w{4}$/.test(icao)) {
      return res.status(400).json({ error: 'ICAO inválido' });
    }
    await deleteAirport(icao);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

export default router;
