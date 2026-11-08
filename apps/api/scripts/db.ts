// Shared bits for the CLI scripts (run with tsx, outside Nest).
import '../src/config';
import { getPool } from '../src/db/db.service';

export const pool = getPool();

export async function finish(code = 0) {
  await pool.end();
  process.exit(code);
}
