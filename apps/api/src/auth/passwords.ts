import { hash, verify } from '@node-rs/argon2';
import { randomBytes } from 'crypto';

// argon2id with OWASP's recommended minimum (19 MiB, 2 passes), light enough for a serverless function.
const OPTIONS = { memoryCost: 19456, timeCost: 2, parallelism: 1 };

export const hashPassword = (password: string) => hash(password, OPTIONS);

export async function verifyPassword(passwordHash: string, password: string): Promise<boolean> {
  try {
    return await verify(passwordHash, password);
  } catch {
    return false;
  }
}

let dummy: Promise<string> | null = null;

/** Verified against when the e-mail doesn't exist, so response time doesn't reveal which accounts exist. */
export function dummyHash(): Promise<string> {
  dummy ??= hash(randomBytes(16).toString('hex'), OPTIONS);
  return dummy;
}
