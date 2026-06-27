# AI Internship Agent Design

## Goal

Build a portfolio-grade AI internship application assistant that helps manage target jobs, analyze JD fit, generate outreach copy, plan follow-ups, and export application records.

## User Value

The project should show practical AI Agent thinking: turning job data into prioritized actions, reusable messages, and tracked application status. It is useful for AI product, AI application development, and efficiency-tool internships.

## Scope

- Curated job list for Shanghai AI, RAG, data annotation, and AI+Web3 roles.
- Candidate profile with skills and portfolio projects.
- JD matching with score, matched skills, missing skills, priority, and action reason.
- Outreach message generation for each job.
- Pipeline summary by status: not_applied, applied, follow_up, interviewing, rejected.
- Follow-up action planning based on status, dates, and priority.
- JSON export for application records and next actions.

## Architecture

- `src/applicationAgent.js`: pure functions for job normalization, matching, pitch generation, follow-up planning, pipeline summary, and export.
- `src/sampleData.js`: candidate profile and sample job list.
- `server.js`: static file server plus JSON API endpoints.
- `public/`: dashboard UI for pipeline, job cards, generated messages, and next actions.
- `test/`: Node test runner coverage for Agent behavior and API.

## Testing

Tests cover fit scoring, message generation, follow-up planning, pipeline summary, and export schema.
