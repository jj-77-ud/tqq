import http from 'node:http';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { buildExportDataset, calculateQualityMetrics, findAnnotationIssues } from './src/labelOps.js';
import { guidelines, sampleTasks } from './src/sampleData.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const publicDir = path.join(__dirname, 'public');
const port = Number(process.env.PORT || 5188);

const server = http.createServer(async (request, response) => {
  try {
    const url = new URL(request.url, 'http://' + request.headers.host);

    if (request.method === 'GET' && url.pathname === '/api/tasks') {
      return sendJson(response, 200, { tasks: sampleTasks, guidelines });
    }

    if (request.method === 'POST' && url.pathname === '/api/metrics') {
      const body = await readJsonBody(request);
      const annotations = Array.isArray(body.annotations) ? body.annotations : [];
      return sendJson(response, 200, {
        metrics: calculateQualityMetrics(annotations),
        issues: findAnnotationIssues(annotations),
        preview: buildExportDataset(annotations).slice(0, 5)
      });
    }

    if (request.method === 'POST' && url.pathname === '/api/export') {
      const body = await readJsonBody(request);
      const annotations = Array.isArray(body.annotations) ? body.annotations : [];
      return sendJson(response, 200, {
        dataset: buildExportDataset(annotations)
      });
    }

    if (request.method === 'GET') {
      return serveStatic(url.pathname, response);
    }

    return sendJson(response, 405, { error: 'Method not allowed.' });
  } catch (error) {
    return sendJson(response, 500, { error: error.message || 'Internal server error.' });
  }
});

server.listen(port, '127.0.0.1', () => {
  console.log('AI LabelOps running at http://127.0.0.1:' + port);
});

async function serveStatic(routePath, response) {
  const safePath = routePath === '/' ? '/index.html' : routePath;
  const filePath = path.normalize(path.join(publicDir, safePath));

  if (!filePath.startsWith(publicDir)) {
    return sendText(response, 403, 'Forbidden');
  }

  try {
    const content = await readFile(filePath);
    response.writeHead(200, { 'Content-Type': getContentType(filePath) });
    response.end(content);
  } catch {
    sendText(response, 404, 'Not found');
  }
}

function readJsonBody(request) {
  return new Promise((resolve, reject) => {
    let raw = '';
    request.on('data', (chunk) => {
      raw += chunk;
      if (raw.length > 1_000_000) {
        request.destroy();
        reject(new Error('请求内容过大。'));
      }
    });
    request.on('end', () => {
      try {
        resolve(raw ? JSON.parse(raw) : {});
      } catch {
        reject(new Error('请求体不是合法 JSON。'));
      }
    });
    request.on('error', reject);
  });
}

function sendJson(response, status, payload) {
  response.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store'
  });
  response.end(JSON.stringify(payload, null, 2));
}

function sendText(response, status, message) {
  response.writeHead(status, { 'Content-Type': 'text/plain; charset=utf-8' });
  response.end(message);
}

function getContentType(filePath) {
  const ext = path.extname(filePath);
  const types = {
    '.html': 'text/html; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.js': 'application/javascript; charset=utf-8'
  };
  return types[ext] || 'application/octet-stream';
}
