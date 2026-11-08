import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { DbService } from '../db/db.service';

/**
 * Fixed-window counter stored in MySQL. In-memory throttling doesn't work on serverless (every
 * request may hit a different instance), so the count lives in the database.
 */
@Injectable()
export class RateLimitService {
  constructor(private readonly db: DbService) {}

  /** Counts one hit and throws 429 once `limit` hits happen inside `windowSeconds`. */
  async hit(bucket: string, limit: number, windowSeconds: number, message = 'Muitas tentativas. Aguarde alguns minutos.') {
    const key = bucket.slice(0, 190);
    await this.db.run(
      `INSERT INTO rate_limits (bucket, hits, reset_at) VALUES (?, 1, UTC_TIMESTAMP() + INTERVAL ? SECOND)
       ON DUPLICATE KEY UPDATE
         hits = IF(reset_at <= UTC_TIMESTAMP(), 1, hits + 1),
         reset_at = IF(reset_at <= UTC_TIMESTAMP(), UTC_TIMESTAMP() + INTERVAL ? SECOND, reset_at)`,
      [key, windowSeconds, windowSeconds],
    );
    const row = await this.db.one<{ hits: number }>('SELECT hits FROM rate_limits WHERE bucket = ?', [key]);
    if (row && row.hits > limit) throw new HttpException(message, HttpStatus.TOO_MANY_REQUESTS);
  }

  async reset(bucket: string) {
    await this.db.run('DELETE FROM rate_limits WHERE bucket = ?', [bucket.slice(0, 190)]);
  }
}
