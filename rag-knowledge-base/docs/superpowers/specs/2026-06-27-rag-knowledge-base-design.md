# RAG Knowledge Base Design

## Goal

Build a small portfolio-grade RAG knowledge-base assistant that can answer AI/Web3 internship and data annotation questions from curated local documents.

## User Value

The project should show the user can prepare documents, split them into searchable chunks, retrieve evidence, answer with citations, and export question-answer records. This is useful for AI internship, AI trainer, and data annotation part-time applications.

## Scope

- Local document set with AI internship, data annotation, Web3 risk, and Shanghai job-search preparation content.
- Deterministic local retrieval based on tokenization, keyword weighting, phrase overlap, and top-k ranking.
- A generated answer assembled from the highest scoring evidence chunks.
- Evidence panel with source title, chunk id, score, and matched terms.
- JSON export of the current answer record.

## Architecture

- `src/ragEngine.js`: pure functions for tokenization, chunking, retrieval, answer generation, and export.
- `src/sampleDocuments.js`: portfolio-friendly sample knowledge documents.
- `server.js`: static file server plus JSON API endpoints.
- `public/`: browser UI for asking questions and reviewing evidence.
- `test/`: Node test runner coverage for the RAG behavior.

## Testing

Tests should cover tokenization, chunking, relevant retrieval, answer citations, and export schema.
