const test = require('node:test');
const assert = require('node:assert/strict');
const http = require('node:http');
const app = require('../src/app');

test('health endpoint returns the API status contract', async () => {
  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, resolve));
  const port = server.address().port;
  const response = await fetch(`http://127.0.0.1:${port}/api/v1/health`);
  const body = await response.json();
  await new Promise((resolve, reject) => server.close((error) => (error ? reject(error) : resolve())));
  assert.equal(response.status, 200);
  assert.deepEqual(body, { success: true, message: 'Server is running' });
});
