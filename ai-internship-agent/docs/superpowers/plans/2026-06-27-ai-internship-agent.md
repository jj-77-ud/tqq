# AI Internship Agent Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a local AI internship application assistant that demonstrates JD matching, outreach generation, pipeline tracking, follow-up planning, and exportable job records.

**Architecture:** Pure agent logic lives in `src/applicationAgent.js`, sample job data lives in `src/sampleData.js`, the Node server exposes data and summaries, and the browser UI renders an application workflow dashboard.

**Tech Stack:** Node.js built-in HTTP server, Vanilla JavaScript, HTML/CSS, Node.js test runner.

---

### Task 1: Core Application Agent

**Files:**
- Create: `test/applicationAgent.test.js`
- Create: `src/applicationAgent.js`

- [ ] **Step 1: Write failing tests**

Cover JD matching, outreach message generation, follow-up planning, pipeline summary, and export schema.

- [ ] **Step 2: Run test to verify failure**

Run: `npm.cmd test`
Expected: FAIL because `src/applicationAgent.js` does not exist.

- [ ] **Step 3: Implement minimal Agent engine**

Create `analyzeJobFit`, `generateOutreachMessage`, `planFollowUps`, `summarizePipeline`, and `buildApplicationExport`.

- [ ] **Step 4: Run test to verify pass**

Run: `npm.cmd test`
Expected: PASS with all agent tests green.

### Task 2: API and Dashboard

**Files:**
- Create: `src/sampleData.js`
- Create: `server.js`
- Create: `public/index.html`
- Create: `public/app.js`
- Create: `public/styles.css`
- Create: `README.md`

- [ ] **Step 1: Add candidate profile and sample jobs**

Include AI product, RAG backend, AI training, and AI+Web3 jobs.

- [ ] **Step 2: Add server endpoints**

Expose `GET /api/jobs`, `GET /api/summary`, and `GET /api/export`.

- [ ] **Step 3: Build dashboard UI**

Show KPI cards, pipeline status, priority jobs, generated outreach, and follow-up actions.

- [ ] **Step 4: Add README**

Document run commands, features, resume bullets, and demo script.

### Task 3: Verification and Publishing

**Files:**
- Verify all files under `D:\web\ai-internship-agent`

- [ ] **Step 1: Run tests**

Run: `npm.cmd test`
Expected: PASS.

- [ ] **Step 2: Start local server**

Run: `npm.cmd start`
Expected: app available at `http://127.0.0.1:5196`.

- [ ] **Step 3: Browser screenshots**

Capture desktop and mobile screenshots.

- [ ] **Step 4: Upload to GitHub**

Upload project under `ai-internship-agent/` in `jj-77-ud/tqq`.
