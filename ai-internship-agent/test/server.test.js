import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import { createRequestHandler } from '../server.js';

test('server exposes jobs, summary, and export endpoints', async () => {
  const server = http.createServer(createRequestHandler());
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const port = server.address().port;
  const baseUrl = 'http://127.0.0.1:' + port;

  try {
    const jobsResponse = await fetch(baseUrl + '/api/jobs');
    assert.equal(jobsResponse.status, 200);
    const jobsPayload = await jobsResponse.json();
    assert.ok(jobsPayload.jobs.length >= 5);
    assert.ok(jobsPayload.jobs[0].fit);
    assert.ok(jobsPayload.jobs[0].outreach);

    const summaryResponse = await fetch(baseUrl + '/api/summary');
    assert.equal(summaryResponse.status, 200);
    const summary = await summaryResponse.json();
    assert.ok(summary.totalJobs >= 5);
    assert.ok(summary.followUps.length > 0);

    const exportResponse = await fetch(baseUrl + '/api/export');
    assert.equal(exportResponse.status, 200);
    const exportPayload = await exportResponse.json();
    assert.equal(exportPayload.project, 'ai-internship-agent');
    assert.ok(exportPayload.nextActions.length > 0);
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});
