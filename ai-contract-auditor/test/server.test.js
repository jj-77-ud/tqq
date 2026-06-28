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

test("GET /api/samples returns sample contract metadata", async () => {
  const response = await request("/api/samples");

  assert.equal(response.status, 200);
  assert.ok(response.body.samples.some((sample) => sample.name === "VulnerableVault"));
  assert.ok(response.body.samples.some((sample) => sample.name === "LotteryWithTxOrigin"));
});

test("GET /api/report returns report for named sample", async () => {
  const response = await request("/api/report?sample=VulnerableVault");

  assert.equal(response.status, 200);
  assert.equal(response.body.report.project, "ai-contract-auditor");
  assert.equal(response.body.report.summary.overallSeverity, "High");
  assert.ok(response.body.llmPrompt.includes("REENTRANCY-001"));
});

test("POST /api/audit audits custom Solidity source", async () => {
  const source = `
pragma solidity ^0.8.24;
contract OriginGate {
  address public owner;
  function sweep(address payable to) external {
    require(tx.origin == owner, "owner");
    to.transfer(address(this).balance);
  }
}
`;
  const response = await request("/api/audit", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ title: "OriginGate", source }),
  });

  assert.equal(response.status, 200);
  assert.equal(response.body.report.target.title, "OriginGate");
  assert.ok(response.body.report.findings.some((finding) => finding.id === "AUTH-001"));
});
