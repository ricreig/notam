import pool from "../db/pool";
import { categories } from "../catalogs/categories";
import { elements } from "../catalogs/elements";

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

  await pool.end();
  console.log("Seed complete");
}

main().catch(err => {
  console.error("Seed failed", err);
  process.exit(1);
});
