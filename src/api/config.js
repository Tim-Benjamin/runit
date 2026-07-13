// src/api/config.js
// DEV: files are at http://localhost/runit-backend/api/...
// PROD: Vercel proxies /api/... to https://runit.site.je/api/...

const API_BASE = import.meta.env.DEV
  ? 'http://localhost/runit-backend'
  : '';

export default API_BASE;
