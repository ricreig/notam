import { Router } from 'express';
import { categories, severityColorMap } from '../catalogs/categories';
import { elements } from '../catalogs/elements';

const router = Router();

router.get('/', (_req, res) => {
  res.json({
    data: {
      categories,
      elements,
      severityColors: severityColorMap,
    },
  });
});

export default router;
