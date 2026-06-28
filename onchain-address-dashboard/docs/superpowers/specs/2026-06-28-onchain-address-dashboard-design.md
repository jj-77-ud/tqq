# Onchain Address Dashboard Design

## Goal

Build a fresh Web3 portfolio project that analyzes wallet-like transaction data and produces an address profile, risk tags, flow summary, counterparties, activity timeline, and exportable report.

## Scope

- Work offline with curated sample wallet datasets so the app runs without RPC keys or paid APIs.
- Validate and normalize EVM-style addresses.
- Summarize transaction count, volume, inflow, outflow, net flow, asset exposure, contract interactions, and active days.
- Detect address risk signals: mixer exposure, phishing interaction, high approval count, rapid bot-like activity, bridge-heavy behavior, dusting, failed transactions, and concentration risk.
- Generate readable persona labels such as DeFi Power User, Bridge Hopper, Exchange Collector, Airdrop Farmer, or High Risk Counterparty.
- Provide a dashboard with sample selector, address input, metrics, risk tags, counterparty table, asset-flow bars, timeline, and JSON report preview.

## Architecture

- `src/sampleWallets.js`: curated address datasets with transactions, counterparties, assets, and labels.
- `src/riskRules.js`: independent risk detectors and scoring helpers.
- `src/addressAnalyzer.js`: address validation, aggregation, persona classification, and report generation.
- `server.js`: static server and JSON API endpoints.
- `public/`: dashboard UI.
- `test/`: Node test runner coverage for analysis and API behavior.

## UX

The app opens directly into the analysis workspace. The user chooses a sample wallet or pastes an EVM address, then sees the wallet profile, risk score, funds movement, top counterparties, asset mix, and report JSON.

## Testing

Tests cover address normalization, wallet summary metrics, risk detection, persona classification, report schema, sample lookup, and API responses.
