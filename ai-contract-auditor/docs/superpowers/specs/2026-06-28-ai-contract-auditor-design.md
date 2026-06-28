# AI Contract Auditor Design

## Goal

Build a fresh portfolio project that audits Solidity source code and produces AI-style security findings, severity levels, fixes, and a copyable report without requiring external API access.

## Scope

- Parse Solidity source for contracts, functions, modifiers, payable methods, external calls, and risky keywords.
- Detect common smart contract risks: reentrancy, tx.origin authorization, delegatecall, selfdestruct, weak randomness, unchecked low-level calls, missing access control, timestamp dependence, and old pragma versions.
- Generate a structured audit report with risk score, severity summary, findings, suggested patches, interview-friendly explanation, and an LLM prompt that can be copied into DeepSeek or ChatGPT.
- Provide a dashboard with sample contracts, source editor, risk metrics, findings, fix checklist, and JSON report preview.
- Keep the implementation zero-dependency and fully runnable offline.

## Architecture

- `src/contractParser.js`: focused Solidity text parser and source analysis helpers.
- `src/sampleContracts.js`: curated vulnerable and fixed contract examples.
- `src/auditEngine.js`: risk rules, scoring, report generation, and LLM prompt assembly.
- `server.js`: static server and JSON API endpoints.
- `public/`: browser dashboard.
- `test/`: Node test runner coverage for parser, audit engine, and API.

## UX

The app opens directly into the audit workspace. Users choose a sample or paste Solidity, click analyze, and see risk score, top issues, evidence lines, remediation steps, and a report JSON panel.

## Testing

Tests verify parser extraction, vulnerability detection, risk scoring, report schema, API behavior, and sample loading.
