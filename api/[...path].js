const app = require('../server');

// Vercel catch-all function forwards the original /api/* path to Express.
// Express defines its routes under /api, so do not strip the prefix here.
module.exports = (req, res) => app(req, res);
