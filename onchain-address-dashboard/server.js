import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { buildAddressReport } from "./src/addressAnalyzer.js";
import { getSampleWallet, listSampleWallets } from "./src/sampleWallets.js";

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
  return raw.trim() ? JSON.parse(raw) : {};
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

export function createRequestHandler() {
  return async function requestHandler(request, response) {
    try {
      const url = new URL(request.url || "/", "http://127.0.0.1");

      if (request.method === "GET" && url.pathname === "/api/wallets") {
        sendJson(response, 200, { wallets: listSampleWallets() });
        return;
      }

      if (request.method === "GET" && url.pathname === "/api/report") {
        const wallet = getSampleWallet(url.searchParams.get("address") || "defi-power-user");
        sendJson(response, 200, {
          wallet,
          report: buildAddressReport(wallet),
        });
        return;
      }

      if (request.method === "POST" && url.pathname === "/api/analyze") {
        const wallet = await readJsonBody(request);
        if (!wallet.address || !Array.isArray(wallet.transactions)) {
          sendJson(response, 400, { error: "address and transactions are required" });
          return;
        }
        sendJson(response, 200, { report: buildAddressReport(wallet) });
        return;
      }

      if (request.method === "GET" && (await sendStatic(response, url.pathname))) {
        return;
      }

      sendJson(response, 404, { error: "Not found" });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      sendJson(response, message.includes("JSON") || message.includes("Invalid") ? 400 : 500, {
        error: message,
      });
    }
  };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const port = Number(process.env.PORT || 5202);
  const server = createServer(createRequestHandler());

  server.listen(port, "127.0.0.1", () => {
    console.log(`Onchain Address Dashboard running at http://127.0.0.1:${port}`);
  });
}
