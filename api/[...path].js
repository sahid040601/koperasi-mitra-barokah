// Vercel catch-all Serverless Function adapter for the Express application.
// The application is designed to run locally with app.listen(); on Vercel we
// suppress that listener and export the Express app as the request handler.
const http = require('http');

const originalListen = http.Server.prototype.listen;
http.Server.prototype.listen = function () {
  return this;
};

let app;
try {
  app = require('../server');
} finally {
  http.Server.prototype.listen = originalListen;
}

module.exports = app;
