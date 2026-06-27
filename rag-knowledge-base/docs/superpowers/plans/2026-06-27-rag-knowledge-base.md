# RAG Knowledge Base Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a local RAG knowledge-base question answering assistant that demonstrates retrieval, evidence citation, and exportable QA records.

**Architecture:** The app uses pure RAG engine functions in `src/ragEngine.js`, sample documents in `src/sampleDocuments.js`, a small Node HTTP server, and a responsive browser UI. Retrieval is deterministic so the demo works without an external model key.

**Tech Stack:** Node.js built-in HTTP server, Vanilla JavaScript, HTML/CSS, Node.js test runner.

---

### Task 1: Core RAG Engine

**Files:**
- Create: `test/ragEngine.test.js`
- Create: `src/ragEngine.js`

- [ ] **Step 1: Write failing tests**

Use tests for tokenization, document chunking, relevant retrieval, answer generation, and export schema.

- [ ] **Step 2: Run test to verify failure**

Run: `npm.cmd test`
Expected: FAIL because `src/ragEngine.js` does not exist.

- [ ] **Step 3: Implement minimal RAG engine**

Create pure functions: `tokenize`, `chunkDocuments`, `retrieveRelevantChunks`, `generateAnswer`, and `buildQaExport`.

- [ ] **Step 4: Run test to verify pass**

Run: `npm.cmd test`
Expected: PASS with all RAG engine tests green.

### Task 2: App Shell and API

**Files:**
- Create: `src/sampleDocuments.js`
- Create: `server.js`
- Create: `public/index.html`
- Create: `public/app.js`
- Create: `public/styles.css`
- Create: `README.md`

- [ ] **Step 1: Add sample knowledge documents**

Include AI internship, data annotation, Web3 risk, and Shanghai job search documents.

- [ ] **Step 2: Add server endpoints**

Expose `GET /api/documents` and `POST /api/ask`.

- [ ] **Step 3: Build UI**

Show document list, question input, generated answer, evidence cards, and export button.

- [ ] **Step 4: Add README**

Document run commands, features, resume bullets, and demo script.

### Task 3: Verification and Publishing

**Files:**
- Verify all files under `D:\web\rag-knowledge-base`

- [ ] **Step 1: Run tests**

Run: `npm.cmd test`
Expected: PASS.

- [ ] **Step 2: Start local server**

Run: `npm.cmd start`
Expected: app available at `http://127.0.0.1:5190`.

- [ ] **Step 3: Browser screenshot**

Capture a screenshot showing answer and evidence.

- [ ] **Step 4: Upload to GitHub**

Upload project under `rag-knowledge-base/` in `jj-77-ud/tqq`.
