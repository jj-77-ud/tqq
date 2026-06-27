import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import {
  normalizeEvaluationRecord,
  calculateModelMetrics,
  compareModelPairs,
  findEvaluationIssues,
  buildEvaluationExport
} from './src/evalEngine.js';
import { sampleEvaluations } from './src/sampleEvaluations.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const publicDir = path.join(__dirname, 'public');
const PORT = Number(process.env.PORT || 5192);

const mimeTypes = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8'
};

export function createRequestHandler() {
  return async function handleRequest(request, response) {
    try {
      const url = new URL(request.url, 'http://127.0.0.1');

      if (request.method === 'GET' && url.pathname === '/api/evaluations') {
        return sendJson(response, 200, {
          records: sampleEvaluations.map(normalizeEvaluationRecord)
        });
      }

      if (request.method === 'GET' && url.pathname === '/api/summary') {
        const summary = calculateModelMetrics(sampleEvaluations);
        return sendJson(response, 200, {
          ...summary,
          pairComparison: compareModelPairs(sampleEvaluations),
          issues: findEvaluationIssues(sampleEvaluations)
        });
      }

      if (request.method === 'GET' && url.pathname === '/api/export') {
        return sendJson(response, 200, buildEvaluationExport(sampleEvaluations));
      }

      if (request.method !== 'GET') {
        return sendText(response, 405, 'Method Not Allowed', 'text/plain; charset=utf-8');
      }

      return serveStatic(url.pathname, response);
    } catch (error) {
      return sendJson(response, 500, { error: error.message });
    }
  };
}

async function serveStatic(urlPathname, response) {
  const normalizedPath = urlPathname === '/' ? '/index.html' : urlPathname;
  const relativePath = decodeURIComponent(normalizedPath).replace(/^\/+/, '');
  const filePath = path.resolve(publicDir, relativePath);

  if (!filePath.startsWith(publicDir)) {
    return sendText(response, 403, 'Forbidden', 'text/plain; charset=utf-8');
  }

  try {
    const content = await fs.readFile(filePath);
    const contentType = mimeTypes[path.extname(filePath)] || 'application/octet-stream';
    response.writeHead(200, { 'Content-Type': contentType });
    response.end(content);
  } catch {
    sendText(response, 404, 'Not Found', 'text/plain; charset=utf-8');
  }
}

function sendJson(response, statusCode, payload) {
  response.writeHead(statusCode, { 'Content-Type': 'application/json; charset=utf-8' });
  response.end(JSON.stringify(payload, null, 2));
}

function sendText(response, statusCode, text, contentType) {
  response.writeHead(statusCode, { 'Content-Type': contentType });
  response.end(text);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const server = http.createServer(createRequestHandler());
  server.listen(PORT, '127.0.0.1', () => {
    console.log('LLM Eval Dashboard running at http://127.0.0.1:' + PORT);
  });
}
