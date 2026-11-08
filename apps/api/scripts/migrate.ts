/**
 * Applies migrations/*.sql in name order, once each. Safe to run on every deploy.
 *   npm run db:migrate -w apps/api
 */
import { readdirSync, readFileSync } from 'fs';
import { join } from 'path';
import { finish, pool } from './db';

async function main() {
  await pool.query(`CREATE TABLE IF NOT EXISTS schema_migrations (
    name VARCHAR(190) PRIMARY KEY,
    applied_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`);

  const [rows] = await pool.query('SELECT name FROM schema_migrations');
  const applied = new Set((rows as { name: string }[]).map((r) => r.name));
  const dir = join(__dirname, '..', 'migrations');
  const files = readdirSync(dir).filter((f) => f.endsWith('.sql')).sort();

  for (const file of files) {
    if (applied.has(file)) continue;
    const sql = readFileSync(join(dir, file), 'utf8');
    // Statements end with ";" at the end of a line; comments are dropped first.
    const statements = sql
      .split('\n')
      .filter((line) => !line.trim().startsWith('--'))
      .join('\n')
      .split(/;\s*$/m)
      .map((s) => s.trim())
      .filter(Boolean);
    console.log(`→ ${file} (${statements.length} statements)`);
    // MySQL commits DDL implicitly, so a failed migration is reported and must be fixed by hand.
    for (const statement of statements) await pool.query(statement);
    await pool.query('INSERT INTO schema_migrations (name) VALUES (?)', [file]);
  }
  console.log('Banco atualizado.');
}

main().then(
  () => finish(),
  (err) => {
    console.error(err);
    return finish(1);
  },
);
