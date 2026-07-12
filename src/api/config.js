// src/api/config.js
// In production on Vercel, use relative URL (proxied)
// In local dev, use localhost directly
const API_BASE = import.meta.env.DEV
  ? 'https://runit.site.je'
  : '';

export default API_BASE;
