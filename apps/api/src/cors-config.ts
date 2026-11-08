import { config } from './config';

// In production the site calls the api on the same domain (rewrite), so browsers never need CORS.
// This allowlist only covers local dev and direct calls; extra origins go in ALLOWED_ORIGINS.
export const corsOptions = {
  origin: ['http://localhost:5173', ...config.allowedOrigins],
  credentials: true,
};
