import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { buildAuditReport, buildLLMPrompt } from "./src/auditEngine.js";
import { getSampleContract, listSampleContracts } from "./src/sampleContracts.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const publicDir = path.join(__dirname, "public");

const contentTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
};

function sendJson(response, statusCode, payload) {
  response.writeHead(statusCode, {
    "content-type": "application/json; charset=utf-8",
    "cache-control": "no-store",
  });
  response.end(JSON.stringify(payload, null, 2));
}

async function readRequestBody(request) {
  const chunks = [];
  let size = 0;

  for await (const chunk of request) {
    size += chunk.length;
    if (size > 1_000_000) {
      throw new Error("Request body too large");
    }
    chunks.push(chunk);
  }

  return Buffer.concat(chunks).toString("utf8");
}

async function readJsonBody(request) {
  const raw = await readRequestBody(request);
  if (!raw.trim()) {
    return {};
  }
  return JSON.parse(raw);
}

async function sendStatic(response, pathname) {
  const safePathname = pathname === "/" ? "/index.html" : pathname;
  const normalized = path.normalize(decodeURIComponent(safePathname)).replace(/^([/\\])+/, "");
  const filePath = path.join(publicDir, normalized);

  if (!filePath.startsWith(publicDir) || !existsSync(filePath)) {
    return false;
  }

  const ext = path.extname(filePath);
  const body = await readFile(filePath);
  response.writeHead(200, {
    "content-type": contentTypes[ext] || "application/octet-stream",
  });
  response.end(body);
  return true;
}

function buildPayload(source, title) {
  const report = buildAuditReport(source, { title });
  return {
    report,
    llmPrompt: buildLLMPrompt(report),
  };
}

export function createRequestHandler() {
  return async function requestHandler(request, response) {
    try {
      const url = new URL(request.url || "/", "http://127.0.0.1");

      if (request.method === "GET" && url.pathname === "/api/samples") {
        sendJson(response, 200, { samples: listSampleContracts() });
        return;
      }

      if (request.method === "GET" && url.pathname === "/api/report") {
        const sample = getSampleContract(url.searchParams.get("sample") || "VulnerableVault");
        sendJson(response, 200, {
          sample,
          ...buildPayload(sample.source, sample.name),
        });
        return;
      }

      if (request.method === "POST" && url.pathname === "/api/audit") {
        const body = await readJsonBody(request);
        if (!body.source || typeof body.source !== "string") {
          sendJson(response, 400, { error: "source is required" });
          return;
        }
        sendJson(response, 200, buildPayload(body.source, body.title || "Custom Contract"));
        return;
      }

      if (request.method === "GET" && (await sendStatic(response, url.pathname))) {
        return;
      }

      sendJson(response, 404, { error: "Not found" });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      sendJson(response, message.includes("JSON") ? 400 : 500, { error: message });
    }
  };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const port = Number(process.env.PORT || 5200);
  const server = createServer(createRequestHandler());

  server.listen(port, "127.0.0.1", () => {
    console.log(`AI Contract Auditor running at http://127.0.0.1:${port}`);
  });
}
