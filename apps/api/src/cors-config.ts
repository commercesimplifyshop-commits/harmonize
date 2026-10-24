// In production the site calls the api on the same domain, so browsers never need CORS.
// This allowlist only covers local dev; extra origins go in ALLOWED_ORIGINS (comma-separated).
const extraOrigins = (process.env.ALLOWED_ORIGINS ?? '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

export const corsOptions = {
  origin: ['http://localhost:5173', ...extraOrigins],
  credentials: true,
};
