import test from "node:test";
import assert from "node:assert/strict";
import { getSampleWallet, listSampleWallets } from "../src/sampleWallets.js";
import {
  normalizeAddress,
  analyzeWallet,
  buildAddressReport,
  summarizeTransactions,
} from "../src/addressAnalyzer.js";

test("normalizeAddress accepts EVM addresses and rejects invalid input", () => {
  const address = "0xA11CE00000000000000000000000000000000001";

  assert.equal(normalizeAddress(address), address.toLowerCase());
  assert.throws(() => normalizeAddress("not-a-wallet"), /Invalid EVM address/);
});

test("listSampleWallets exposes multiple portfolio-ready address profiles", () => {
  const wallets = listSampleWallets();

  assert.ok(wallets.length >= 3);
  assert.ok(wallets.some((wallet) => wallet.persona === "DeFi Power User"));
  assert.ok(wallets.some((wallet) => wallet.persona === "High Risk Counterparty"));
});

test("summarizeTransactions aggregates volume, net flow, assets, and counterparties", () => {
  const wallet = getSampleWallet("defi-power-user");
  const summary = summarizeTransactions(wallet.transactions, wallet.address);

  assert.equal(summary.transactionCount, wallet.transactions.length);
  assert.ok(summary.totalVolumeUsd > 100000);
  assert.ok(summary.contractInteractions >= 4);
  assert.ok(summary.assetFlows.some((asset) => asset.asset === "USDC"));
  assert.ok(summary.topCounterparties.length > 0);
});

test("analyzeWallet detects high-risk counterparty exposure and assigns risk tags", () => {
  const wallet = getSampleWallet("high-risk-counterparty");
  const analysis = analyzeWallet(wallet);

  assert.equal(analysis.persona, "High Risk Counterparty");
  assert.ok(analysis.riskScore >= 80);
  assert.ok(analysis.riskTags.includes("mixer-exposure"));
  assert.ok(analysis.riskTags.includes("phishing-counterparty"));
});

test("buildAddressReport creates exportable report with timeline and recommendations", () => {
  const wallet = getSampleWallet("bridge-hopper");
  const report = buildAddressReport(wallet);

  assert.equal(report.project, "onchain-address-dashboard");
  assert.equal(report.target.address, wallet.address.toLowerCase());
  assert.ok(report.summary.transactionCount > 0);
  assert.ok(report.timeline.length > 0);
  assert.ok(report.recommendations.length >= 3);
});
