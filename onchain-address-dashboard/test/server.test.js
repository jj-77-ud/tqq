import { once } from "node:events";
import { createServer } from "node:http";
import test from "node:test";
import assert from "node:assert/strict";
import { createRequestHandler } from "../server.js";

async function request(pathname, options = {}) {
  const server = createServer(createRequestHandler());
  server.listen(0, "127.0.0.1");
  await once(server, "listening");
  const { port } = server.address();

  try {
    const response = await fetch(`http://127.0.0.1:${port}${pathname}`, options);
    const text = await response.text();
    const body = response.headers.get("content-type")?.includes("application/json")
      ? JSON.parse(text)
      : text;

    return { status: response.status, body };
  } finally {
    server.close();
    await once(server, "close");
  }
}

test("GET /api/wallets returns sample wallet metadata", async () => {
  const response = await request("/api/wallets");

  assert.equal(response.status, 200);
  assert.ok(response.body.wallets.some((wallet) => wallet.id === "defi-power-user"));
  assert.ok(response.body.wallets.some((wallet) => wallet.id === "high-risk-counterparty"));
});

test("GET /api/report returns report by sample id", async () => {
  const response = await request("/api/report?address=high-risk-counterparty");

  assert.equal(response.status, 200);
  assert.equal(response.body.report.project, "onchain-address-dashboard");
  assert.equal(response.body.report.target.persona, "High Risk Counterparty");
  assert.ok(response.body.report.summary.riskScore >= 80);
});

test("POST /api/analyze analyzes custom wallet payload", async () => {
  const payload = {
    id: "custom",
    address: "0xC0FFEE0000000000000000000000000000000004",
    label: "Custom Wallet",
    persona: "Custom",
    description: "Custom analysis",
    transactions: [
      {
        hash: "0xcustom01",
        timestamp: "2026-06-20T10:00:00Z",
        direction: "in",
        counterparty: "0xMIXER00000000000000000000000000000000001",
        counterpartyType: "mixer",
        asset: "ETH",
        amountUsd: 3000,
        method: "receive",
        contractInteraction: true,
        labels: ["mixer"],
        failed: false
      }
    ]
  };
  const response = await request("/api/analyze", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(payload),
  });

  assert.equal(response.status, 200);
  assert.ok(response.body.report.summary.riskTags.includes("mixer-exposure"));
});
