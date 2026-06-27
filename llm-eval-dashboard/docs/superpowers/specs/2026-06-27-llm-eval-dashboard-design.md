# LLM Eval Dashboard Design

## Goal

Build a portfolio-grade LLM evaluation dashboard for AI training, data annotation, and model quality review part-time applications.

## User Value

The project should show that the user understands how to score model answers, compare two model outputs, identify error types, summarize quality metrics, and export evaluation data.

## Scope

- Curated evaluation samples for AI job search, data annotation, Web3 risk, and RAG product support.
- Five scoring dimensions: accuracy, relevance, completeness, safety, and clarity.
- Error taxonomy: hallucination, missing_context, unsafe_advice, wrong_format, vague_answer.
- Model leaderboard with average score, pass rate, safety risk count, and error distribution.
- A/B comparison by prompt id.
- JSON export for evaluation records and summary.

## Architecture

- `src/evalEngine.js`: pure functions for normalization, scoring, leaderboard, pair comparison, issue detection, and export.
- `src/sampleEvaluations.js`: sample prompts, model answers, scores, error types, and reviewer notes.
- `server.js`: static file server plus JSON API endpoints.
- `public/`: dashboard UI for metrics, samples, model comparison, and export.
- `test/`: Node test runner coverage for evaluation behavior and API.

## Testing

Tests cover score normalization, model metrics, pair comparison, issue flags, and export schema.
