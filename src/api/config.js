// src/api/config.js
// In production on Vercel, use relative URL (proxied)
// In local dev, use localhost directly
const API_BASE = import.meta.env.DEV
  ? 'http://localhost/runit-backend'
  : 'https://runit.site.je/api/';

export default API_BASE;
