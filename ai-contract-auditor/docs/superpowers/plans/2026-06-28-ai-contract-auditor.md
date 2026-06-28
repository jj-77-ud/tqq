# AI Contract Auditor Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a fresh AI-style Solidity contract auditor with offline rules, report export, and dashboard UI.

**Architecture:** The parser, sample contracts, and audit engine live under `src/`. The server exposes sample/report/audit endpoints and serves the browser dashboard. The frontend is a compact security workspace for reviewing risk score, findings, evidence, and fixes.

**Tech Stack:** Node.js built-in HTTP server, Vanilla JavaScript, HTML/CSS, Node.js test runner.

---

### Task 1: Parser and Audit Engine

**Files:**
- Create: `test/auditEngine.test.js`
- Create: `src/contractParser.js`
- Create: `src/sampleContracts.js`
- Create: `src/auditEngine.js`

- [ ] **Step 1: Write failing tests**

Cover parser extraction, reentrancy detection, tx.origin detection, report schema, and LLM prompt generation.

- [ ] **Step 2: Run test to verify failure**

Run: `npm.cmd test`
Expected: FAIL because `src/auditEngine.js` and related modules do not exist.

- [ ] **Step 3: Implement parser and audit engine**

Create focused source parsing helpers, sample contracts, rule detectors, scoring, and report generation.

- [ ] **Step 4: Run test to verify pass**

Run: `npm.cmd test`
Expected: PASS for parser and engine tests.

### Task 2: API and Dashboard

**Files:**
- Create: `test/server.test.js`
- Create: `server.js`
- Create: `public/index.html`
- Create: `public/app.js`
- Create: `public/styles.css`
- Create: `README.md`

- [ ] **Step 1: Add failing API tests**

Cover `GET /api/samples`, `GET /api/report?sample=...`, and `POST /api/audit`.

- [ ] **Step 2: Implement server endpoints**

Serve static frontend and return JSON audit responses.

- [ ] **Step 3: Build dashboard UI**

Add sample selector, editor, metrics, findings, fix checklist, and report preview.

- [ ] **Step 4: Verify browser**

Start server, capture one desktop screenshot and one mobile screenshot only after tests pass.

### Task 3: Publishing

**Files:**
- Upload all source, docs, tests, and config under `ai-contract-auditor/`.

- [ ] **Step 1: Final tests**

Run: `npm.cmd test`
Expected: PASS.

- [ ] **Step 2: GitHub upload**

Upload to `jj-77-ud/tqq/ai-contract-auditor`.

- [ ] **Step 3: Remote verification**

Fetch README, `src/auditEngine.js`, and `server.js` from GitHub.
