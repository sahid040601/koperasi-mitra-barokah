// Vercel adapter: load the existing Express app without opening a TCP port.
const express = require('express');

let app;
const originalListen = express.application.listen;
express.application.listen = function () {
  app = this;
  return { on() { return this; } };
};

try {
  require('../server');
} finally {
  express.application.listen = originalListen;
}

if (!app) throw new Error('Express app gagal dimuat');
module.exports = app;
