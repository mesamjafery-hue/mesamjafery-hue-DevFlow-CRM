// Vercel serverless entry point.
// Vercel's Node runtime accepts an exported Express app directly
// (server.js is only used for local development with `npm run dev`).
const app = require('../src/app');

module.exports = app;