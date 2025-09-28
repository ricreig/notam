import { Router } from 'express';
import { runImport } from '../scripts/update-notams';

const router = Router();

router.post('/sync', async (req, res) => {
  try {
    const token = req.get('X-Sync-Token') || '';
    if (token !== process.env.SYNC_TOKEN) {
      return res.status(401).json({ ok: false, error: 'unauthorized' });
    }

    const result = await runImport();            // { ok: number, skip: number, total: number }
    const { ok: inserted, skip, total } = result;
    return res.json({ ok: true, inserted, skip, total });
  } catch (e: any) {
    return res.status(500).json({ ok: false, error: e?.message || 'import failed' });
  }
});

export default router;
