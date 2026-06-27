# LLM Eval Dashboard Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a local LLM evaluation dashboard that demonstrates model scoring, A/B comparison, issue detection, and exportable evaluation records.

**Architecture:** Pure evaluation logic lives in `src/evalEngine.js`, sample review data lives in `src/sampleEvaluations.js`, the Node server exposes data and summaries, and the browser UI renders a dashboard for repeated review work.

**Tech Stack:** Node.js built-in HTTP server, Vanilla JavaScript, HTML/CSS, Node.js test runner.

---

### Task 1: Core Evaluation Engine

**Files:**
- Create: `test/evalEngine.test.js`
- Create: `src/evalEngine.js`

- [ ] **Step 1: Write failing tests**

Cover score normalization, leaderboard metrics, model pair wins, quality issue detection, and export schema.

- [ ] **Step 2: Run test to verify failure**

Run: `npm.cmd test`
Expected: FAIL because `src/evalEngine.js` does not exist.

- [ ] **Step 3: Implement minimal evaluation engine**

Create `normalizeEvaluationRecord`, `calculateModelMetrics`, `compareModelPairs`, `findEvaluationIssues`, and `buildEvaluationExport`.

- [ ] **Step 4: Run test to verify pass**

Run: `npm.cmd test`
Expected: PASS with all engine tests green.

### Task 2: API and Dashboard

**Files:**
- Create: `src/sampleEvaluations.js`
- Create: `server.js`
- Create: `public/index.html`
- Create: `public/app.js`
- Create: `public/styles.css`
- Create: `README.md`

- [ ] **Step 1: Add sample evaluations**

Include prompts, model answers, scores, error types, and reviewer notes.

- [ ] **Step 2: Add server endpoints**

Expose `GET /api/evaluations`, `GET /api/summary`, and `GET /api/export`.

- [ ] **Step 3: Build dashboard UI**

Show KPI cards, leaderboard, A/B comparison, error taxonomy, sample review list, and export button.

- [ ] **Step 4: Add README**

Document run commands, features, resume bullets, and demo script.

### Task 3: Verification and Publishing

**Files:**
- Verify all files under `D:\web\llm-eval-dashboard`

- [ ] **Step 1: Run tests**

Run: `npm.cmd test`
Expected: PASS.

- [ ] **Step 2: Start local server**

Run: `npm.cmd start`
Expected: app available at `http://127.0.0.1:5192`.

- [ ] **Step 3: Browser screenshots**

Capture desktop and mobile screenshots.

- [ ] **Step 4: Upload to GitHub**

Upload project under `llm-eval-dashboard/` in `jj-77-ud/tqq`.
