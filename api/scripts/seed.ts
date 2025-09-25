import pool from '../src/db/pool';
import { categories } from '../src/catalogs/categories';
import { elements } from '../src/catalogs/elements';

async function run() {
  console.log('Seeding catalog tables');

  await pool.query('CREATE TABLE IF NOT EXISTS catalog_categories (id TEXT PRIMARY KEY, label TEXT NOT NULL, color TEXT NOT NULL, code TEXT NOT NULL);');
  await pool.query('CREATE TABLE IF NOT EXISTS catalog_elements (id TEXT PRIMARY KEY, category_id TEXT NOT NULL REFERENCES catalog_categories(id), label TEXT NOT NULL, matchers TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[]);');

  for (const category of categories) {
    await pool.query(
      'INSERT INTO catalog_categories (id, label, color, code) VALUES ($1,$2,$3,$4) ON CONFLICT (id) DO UPDATE SET label=EXCLUDED.label, color=EXCLUDED.color, code=EXCLUDED.code;',
      [category.id, category.label, category.color, category.code],
    );
  }

  for (const element of elements) {
    await pool.query(
      'INSERT INTO catalog_elements (id, category_id, label, matchers) VALUES ($1,$2,$3,$4) ON CONFLICT (id) DO UPDATE SET category_id=EXCLUDED.category_id, label=EXCLUDED.label, matchers=EXCLUDED.matchers;',
      [element.id, element.categoryId, element.label, element.matchers],
    );
  }

  await pool.end();
  console.log('Seed complete');
}

run().catch((error) => {
  console.error('Seed failed', error);
  process.exit(1);
});
