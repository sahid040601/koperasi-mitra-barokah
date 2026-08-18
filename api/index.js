// Vercel serverless entrypoint for every /api/* request.
// Express in server.js owns the actual API routes.
const app = require('../server');
module.exports = app;
