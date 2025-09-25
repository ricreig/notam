import express from 'express';
import cors from 'cors';
import notamRouter from './routes/notams';
import airportRouter from './routes/airports';
import catalogRouter from './routes/catalogs';

const app = express();

app.use(cors());
app.use(express.json({ limit: '1mb' }));

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use('/notams', notamRouter);
app.use('/airports', airportRouter);
app.use('/catalogs', catalogRouter);

export default app;
