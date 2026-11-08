import { existsSync } from 'fs';
import { join } from 'path';

// Local dev reads apps/api/.env; hosted environments set real variables.
const envFile = join(__dirname, '..', '.env');
const envFileFromDist = join(__dirname, '..', '..', '.env');
for (const file of [envFile, envFileFromDist]) {
  if (existsSync(file)) {
    process.loadEnvFile(file);
    break;
  }
}

const env = (key: string, fallback = '') => process.env[key]?.trim() || fallback;

const isHosted = !!process.env.VERCEL || env('NODE_ENV') === 'production';

function required(key: string): string {
  const value = env(key);
  if (!value && isHosted) throw new Error(`Missing environment variable ${key}`);
  return value;
}

export const config = {
  isHosted,
  port: Number(env('PORT', '3001')),
  allowedOrigins: env('ALLOWED_ORIGINS')
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean),

  databaseUrl: required('DATABASE_URL'),
  databaseSsl: env('DATABASE_SSL') === 'true',
  databaseSslCa: env('DATABASE_SSL_CA').replace(/\\n/g, '\n'),

  // A fixed dev secret keeps local sessions working across restarts; hosted envs must set one.
  jwtSecret: required('JWT_SECRET') || 'dev-only-secret-change-me',

  recaptchaSecret: env('RECAPTCHA_SECRET'),
  recaptchaMinScore: Number(env('RECAPTCHA_MIN_SCORE', '0.5')),

  resendApiKey: env('RESEND_API_KEY'),
  contactTo: env('CONTACT_TO'),
  contactFrom: env('CONTACT_FROM', 'Site Harmonize <onboarding@resend.dev>'),

  storageDriver: env('STORAGE_DRIVER', 'local') as 'local' | 'blob',
  uploadDir: env('UPLOAD_DIR', './uploads'),
  blobToken: env('BLOB_READ_WRITE_TOKEN'),
};
