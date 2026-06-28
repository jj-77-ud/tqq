import test from "node:test";
import assert from "node:assert/strict";
import { parseContractSource } from "../src/contractParser.js";
import { getSampleContract } from "../src/sampleContracts.js";
import { auditContract, buildAuditReport, buildLLMPrompt } from "../src/auditEngine.js";

test("parseContractSource extracts contracts, functions, modifiers, and payable methods", () => {
  const source = getSampleContract("VulnerableVault").source;
  const parsed = parseContractSource(source);

  assert.ok(parsed.contracts.includes("VulnerableVault"));
  assert.ok(parsed.functions.some((item) => item.name === "withdraw"));
  assert.ok(parsed.payableFunctions.includes("deposit"));
  assert.ok(parsed.externalCallLines.length > 0);
});

test("auditContract flags reentrancy with high severity and concrete fix", () => {
  const source = getSampleContract("VulnerableVault").source;
  const result = auditContract(source, { title: "VulnerableVault" });

  const reentrancy = result.findings.find((finding) => finding.id === "REENTRANCY-001");
  assert.equal(result.overallSeverity, "High");
  assert.ok(result.riskScore >= 80);
  assert.equal(reentrancy.severity, "High");
  assert.ok(reentrancy.evidence.some((line) => line.includes("call{value")));
  assert.ok(reentrancy.recommendations.includes("Apply Checks-Effects-Interactions"));
});

test("auditContract detects tx.origin authorization and weak randomness", () => {
  const source = getSampleContract("LotteryWithTxOrigin").source;
  const result = auditContract(source, { title: "LotteryWithTxOrigin" });

  assert.ok(result.findings.some((finding) => finding.id === "AUTH-001"));
  assert.ok(result.findings.some((finding) => finding.id === "RANDOMNESS-001"));
  assert.ok(result.tags.includes("authorization-risk"));
});

test("buildAuditReport creates exportable AI audit evidence", () => {
  const source = getSampleContract("VulnerableVault").source;
  const report = buildAuditReport(source, { title: "VulnerableVault" });

  assert.equal(report.project, "ai-contract-auditor");
  assert.equal(report.target.title, "VulnerableVault");
  assert.ok(report.createdAt);
  assert.ok(report.summary.findingCount > 0);
  assert.ok(report.reviewPlan.length >= 3);
});

test("buildLLMPrompt includes findings and asks for patch-focused review", () => {
  const report = buildAuditReport(getSampleContract("VulnerableVault").source, {
    title: "VulnerableVault",
  });
  const prompt = buildLLMPrompt(report);

  assert.ok(prompt.includes("Solidity security auditor"));
  assert.ok(prompt.includes("REENTRANCY-001"));
  assert.ok(prompt.includes("patch"));
});
