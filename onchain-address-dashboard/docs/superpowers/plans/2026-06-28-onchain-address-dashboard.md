# Onchain Address Dashboard Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a fresh on-chain address analysis dashboard with offline sample data, risk rules, wallet persona classification, and report export.

**Architecture:** Core analysis lives in `src/`: sample data, risk rules, and address analyzer are separated. The server exposes wallets/report/analyze endpoints and serves the browser dashboard. The frontend renders metrics, risk tags, counterparties, asset flows, activity timeline, and JSON report preview.

**Tech Stack:** Node.js built-in HTTP server, Vanilla JavaScript, HTML/CSS, Node.js test runner.

---

### Task 1: Address Analysis Core

**Files:**
- Create: `test/addressAnalyzer.test.js`
- Create: `src/sampleWallets.js`
- Create: `src/riskRules.js`
- Create: `src/addressAnalyzer.js`

- [ ] **Step 1: Write failing tests**

Cover address validation, sample lookup, flow aggregation, risk detection, persona classification, and report schema.

- [ ] **Step 2: Run test to verify failure**

Run: `npm.cmd test`
Expected: FAIL because `src/addressAnalyzer.js` and related modules do not exist.

- [ ] **Step 3: Implement core modules**

Create sample wallet datasets, risk rules, aggregation helpers, and report generation.

- [ ] **Step 4: Run test to verify pass**

Run: `npm.cmd test`
Expected: PASS for core tests.

### Task 2: API and Dashboard

**Files:**
- Create: `test/server.test.js`
- Create: `server.js`
- Create: `public/index.html`
- Create: `public/app.js`
- Create: `public/styles.css`
- Create: `README.md`

- [ ] **Step 1: Add failing API tests**

Cover `GET /api/wallets`, `GET /api/report?address=...`, and `POST /api/analyze`.

- [ ] **Step 2: Implement server endpoints**

Serve static frontend and return JSON wallet analysis.

- [ ] **Step 3: Build dashboard UI**

Add sample selector, address field, metrics, risk chips, counterparty table, asset-flow bars, timeline, and report preview.

- [ ] **Step 4: Browser verification**

After tests pass, start server and capture exactly one desktop screenshot and one mobile screenshot.

### Task 3: Publishing

**Files:**
- Upload all source, docs, tests, and config under `onchain-address-dashboard/`.

- [ ] **Step 1: Final tests**

Run: `npm.cmd test`
Expected: PASS.

- [ ] **Step 2: GitHub upload**

Upload to `jj-77-ud/tqq/onchain-address-dashboard`.

- [ ] **Step 3: Remote verification**

Fetch README, `src/addressAnalyzer.js`, and `server.js` from GitHub.
