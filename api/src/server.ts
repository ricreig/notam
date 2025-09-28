import dotenv from 'dotenv';
import app from './app';

dotenv.config();

const port = process.env.PORT ? Number(process.env.PORT) : 3001;
app.get('/health', (_req, res) => res.send('ok'));
app.listen(port, () => {
  console.log(`NOTAM API listening on port ${port}`);
});
