import fs from "fs";
import path from "path";
import pool from "../db/pool";

async function main() {
  const migrationsDir = path.resolve(__dirname, "../db/migrations");
  const files = fs.readdirSync(migrationsDir)
    .filter(f => f.endsWith(".sql"))
    .sort();

  for (const file of files) {
    const full = path.join(migrationsDir, file);
    const sql = fs.readFileSync(full, "utf8");
    console.log(`Running migration ${file}`);
    await pool.query(sql);
  }

  await pool.end();
  console.log("Migrations complete");
}

main().catch(err => {
  console.error("Migration failed", err);
  process.exit(1);
});
