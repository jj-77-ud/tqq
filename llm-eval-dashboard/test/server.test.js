import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import { createRequestHandler } from '../server.js';

test('server exposes evaluation summary, records, and export endpoints', async () => {
  const server = http.createServer(createRequestHandler());
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const port = server.address().port;
  const baseUrl = 'http://127.0.0.1:' + port;

  try {
    const summaryResponse = await fetch(baseUrl + '/api/summary');
    assert.equal(summaryResponse.status, 200);
    const summary = await summaryResponse.json();
    assert.ok(summary.leaderboard.length >= 2);
    assert.ok(summary.totalRecords >= 6);

    const recordsResponse = await fetch(baseUrl + '/api/evaluations');
    assert.equal(recordsResponse.status, 200);
    const recordsPayload = await recordsResponse.json();
    assert.ok(recordsPayload.records.length >= 6);
    assert.ok(recordsPayload.records[0].prompt);

    const exportResponse = await fetch(baseUrl + '/api/export');
    assert.equal(exportResponse.status, 200);
    const exportPayload = await exportResponse.json();
    assert.equal(exportPayload.project, 'llm-eval-dashboard');
    assert.ok(exportPayload.issues.length > 0);
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});
