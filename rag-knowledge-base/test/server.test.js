import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import { createRequestHandler } from '../server.js';

test('server exposes documents and ask endpoints', async () => {
  const server = http.createServer(createRequestHandler());
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const port = server.address().port;
  const baseUrl = 'http://127.0.0.1:' + port;

  try {
    const docsResponse = await fetch(baseUrl + '/api/documents');
    assert.equal(docsResponse.status, 200);
    const docsPayload = await docsResponse.json();
    assert.ok(docsPayload.documents.length >= 4);

    const askResponse = await fetch(baseUrl + '/api/ask', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question: '数据标注兼职需要准备什么？' })
    });
    assert.equal(askResponse.status, 200);
    const askPayload = await askResponse.json();
    assert.ok(askPayload.answer.includes('Data Annotation'));
    assert.ok(askPayload.evidence.length > 0);
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});
