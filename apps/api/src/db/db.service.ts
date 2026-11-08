import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { createPool, type Pool, type PoolConnection, type ResultSetHeader, type RowDataPacket } from 'mysql2/promise';
import { config } from '../config';

export type Row = RowDataPacket;
export type Params = (string | number | boolean | null | Date | Buffer)[];

/** Something that can run queries: the pool, or a connection inside a transaction. */
export type Queryable = Pick<Pool | PoolConnection, 'query'>;

let pool: Pool | null = null;

/**
 * One small pool per process. On Vercel each warm instance keeps its own, so the limit stays low
 * to respect the connection cap of small MySQL plans.
 */
export function getPool(): Pool {
  if (!pool) {
    pool = createPool({
      uri: config.databaseUrl,
      connectionLimit: config.isHosted ? 3 : 5,
      // DATE columns come back as 'yyyy-mm-dd' strings, which is what the site uses.
      dateStrings: ['DATE'],
      timezone: 'Z',
      charset: 'utf8mb4',
      ssl: config.databaseSslCa ? { ca: config.databaseSslCa } : config.databaseSsl ? { rejectUnauthorized: true } : undefined,
    });
  }
  return pool;
}

@Injectable()
export class DbService implements OnModuleDestroy {
  get pool(): Pool {
    return getPool();
  }

  async all<T>(sql: string, params: Params = [], db: Queryable = this.pool): Promise<T[]> {
    const [rows] = await db.query<Row[]>(sql, params);
    return rows as T[];
  }

  async one<T>(sql: string, params: Params = [], db: Queryable = this.pool): Promise<T | null> {
    const rows = await this.all<T>(sql, params, db);
    return rows[0] ?? null;
  }

  async run(sql: string, params: Params = [], db: Queryable = this.pool): Promise<ResultSetHeader> {
    const [result] = await db.query<ResultSetHeader>(sql, params);
    return result;
  }

  async transaction<T>(work: (conn: PoolConnection) => Promise<T>): Promise<T> {
    const conn = await this.pool.getConnection();
    try {
      await conn.beginTransaction();
      const result = await work(conn);
      await conn.commit();
      return result;
    } catch (err) {
      await conn.rollback();
      throw err;
    } finally {
      conn.release();
    }
  }

  async onModuleDestroy() {
    // Serverless instances are frozen, not destroyed; this only runs on local shutdown.
    if (pool && !config.isHosted) {
      await pool.end();
      pool = null;
    }
  }
}

/** JSON columns come back parsed from MySQL but as strings from MariaDB. */
export function json<T>(value: unknown): T {
  return (typeof value === 'string' ? JSON.parse(value) : value) as T;
}
