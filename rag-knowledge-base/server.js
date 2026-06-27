import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { chunkDocuments, generateAnswer, buildQaExport } from './src/ragEngine.js';
import { sampleDocuments } from './src/sampleDocuments.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const publicDir = path.join(__dirname, 'public');
const PORT = Number(process.env.PORT || 5190);

const mimeTypes = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml; charset=utf-8'
};

export function createRequestHandler() {
  const chunks = chunkDocuments(sampleDocuments, { maxLength: 110 });

  return async function handleRequest(request, response) {
    try {
      const url = new URL(request.url, 'http://127.0.0.1');

      if (request.method === 'GET' && url.pathname === '/api/documents') {
        return sendJson(response, 200, {
          documents: sampleDocuments.map((document) => ({
            id: document.id,
            title: document.title,
            category: document.category,
            updatedAt: document.updatedAt,
            preview: document.content.slice(0, 78)
          })),
          chunkCount: chunks.length
        });
      }

      if (request.method === 'POST' && url.pathname === '/api/ask') {
        const body = await readJson(request);
        const question = String(body.question || '').trim();

        if (!question) {
          return sendJson(response, 400, { error: 'question is required' });
        }

        const result = generateAnswer(question, chunks, { topK: 4 });
        return sendJson(response, 200, {
          ...result,
          exportRecord: buildQaExport(result)
        });
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

function readJson(request) {
  return new Promise((resolve, reject) => {
    let raw = '';
    request.on('data', (chunk) => {
      raw += chunk;
      if (raw.length > 1_000_000) {
        request.destroy(new Error('request body too large'));
      }
    });
    request.on('end', () => {
      try {
        resolve(raw ? JSON.parse(raw) : {});
      } catch {
        reject(new Error('invalid json body'));
      }
    });
    request.on('error', reject);
  });
}

function sendJson(response, statusCode, payload) {
  response.writeHead(statusCode, { 'Content-Type': 'application/json; charset=utf-8' });
  response.end(JSON.stringify(payload, null, 2));
}

function sendText(response, statusCode, text, contentType) {
  response.writeHead(statusCode, { 'Content-Type': contentType });
  response.end(text);
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const server = http.createServer(createRequestHandler());
  server.listen(PORT, '127.0.0.1', () => {
    console.log('RAG Knowledge Base running at http://127.0.0.1:' + PORT);
  });
}
