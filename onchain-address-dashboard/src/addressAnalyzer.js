import { evaluateRiskRules, severityFromRiskScore } from "./riskRules.js";

export function normalizeAddress(address = "") {
  const normalized = String(address).trim().toLowerCase();
  if (!/^0x[a-f0-9]{40}$/.test(normalized)) {
    throw new Error("Invalid EVM address");
  }
  return normalized;
}

function round(value) {
  return Math.round(Number(value || 0) * 100) / 100;
}

function groupByAsset(transactions) {
  const map = new Map();
  for (const tx of transactions) {
    const entry = map.get(tx.asset) || { asset: tx.asset, inflowUsd: 0, outflowUsd: 0, volumeUsd: 0 };
    if (tx.direction === "in") {
      entry.inflowUsd += tx.amountUsd;
    } else {
      entry.outflowUsd += tx.amountUsd;
    }
    entry.volumeUsd += tx.amountUsd;
    map.set(tx.asset, entry);
  }
  return [...map.values()]
    .map((item) => ({
      ...item,
      inflowUsd: round(item.inflowUsd),
      outflowUsd: round(item.outflowUsd),
      volumeUsd: round(item.volumeUsd),
      netUsd: round(item.inflowUsd - item.outflowUsd),
    }))
    .sort((a, b) => b.volumeUsd - a.volumeUsd);
}

function groupByCounterparty(transactions) {
  const map = new Map();
  for (const tx of transactions) {
    const key = tx.counterparty.toLowerCase();
    const entry = map.get(key) || {
      counterparty: tx.counterparty,
      type: tx.counterpartyType,
      txCount: 0,
      volumeUsd: 0,
      methods: new Set(),
      labels: new Set(),
    };
    entry.txCount += 1;
    entry.volumeUsd += tx.amountUsd;
    entry.methods.add(tx.method);
    tx.labels.forEach((label) => entry.labels.add(label));
    map.set(key, entry);
  }

  return [...map.values()]
    .map((item) => ({
      counterparty: item.counterparty,
      type: item.type,
      txCount: item.txCount,
      volumeUsd: round(item.volumeUsd),
      methods: [...item.methods],
      labels: [...item.labels],
    }))
    .sort((a, b) => b.volumeUsd - a.volumeUsd);
}

function activeDayCount(transactions) {
  return new Set(transactions.map((tx) => tx.timestamp.slice(0, 10))).size;
}

export function summarizeTransactions(transactions = [], address = "") {
  const inflowUsd = transactions
    .filter((tx) => tx.direction === "in")
    .reduce((sum, tx) => sum + tx.amountUsd, 0);
  const outflowUsd = transactions
    .filter((tx) => tx.direction === "out")
    .reduce((sum, tx) => sum + tx.amountUsd, 0);
  const totalVolumeUsd = inflowUsd + outflowUsd;

  return {
    address: address ? normalizeAddress(address) : "",
    transactionCount: transactions.length,
    totalVolumeUsd: round(totalVolumeUsd),
    inflowUsd: round(inflowUsd),
    outflowUsd: round(outflowUsd),
    netFlowUsd: round(inflowUsd - outflowUsd),
    contractInteractions: transactions.filter((tx) => tx.contractInteraction).length,
    failedTransactions: transactions.filter((tx) => tx.failed).length,
    activeDays: activeDayCount(transactions),
    assetFlows: groupByAsset(transactions),
    topCounterparties: groupByCounterparty(transactions).slice(0, 6),
  };
}

function classifyPersona(wallet, summary, riskResult) {
  if (riskResult.riskScore >= 80) {
    return "High Risk Counterparty";
  }
  if (riskResult.riskTags.includes("bridge-heavy")) {
    return "Bridge Hopper";
  }
  if (summary.contractInteractions >= 4 && summary.totalVolumeUsd > 50000) {
    return "DeFi Power User";
  }
  if (summary.topCounterparties.some((item) => item.type === "cex")) {
    return "Exchange Collector";
  }
  return wallet.persona || "Onchain Participant";
}

function buildRecommendations(riskResult, persona) {
  const items = [
    "Review top counterparties before trusting this address.",
    "Check approval history and revoke unused allowances.",
    "Compare transaction timing with known campaign or incident windows.",
  ];

  if (riskResult.riskTags.includes("mixer-exposure")) {
    items.unshift("Treat mixer exposure as a high-priority investigation path.");
  }
  if (riskResult.riskTags.includes("bridge-heavy")) {
    items.push("Trace cross-chain hops before making funding or hiring decisions.");
  }
  if (persona === "DeFi Power User") {
    items.push("Use protocol interaction history as positive evidence of Web3 familiarity.");
  }

  return [...new Set(items)];
}

function buildTimeline(transactions) {
  return [...transactions]
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
    .map((tx) => ({
      hash: tx.hash,
      date: tx.timestamp.slice(0, 10),
      direction: tx.direction,
      asset: tx.asset,
      amountUsd: round(tx.amountUsd),
      method: tx.method,
      counterparty: tx.counterparty,
      counterpartyType: tx.counterpartyType,
      labels: tx.labels,
      failed: tx.failed,
    }));
}

export function analyzeWallet(wallet) {
  const address = normalizeAddress(wallet.address);
  const summary = summarizeTransactions(wallet.transactions, address);
  const riskResult = evaluateRiskRules(wallet.transactions, summary);
  const persona = classifyPersona(wallet, summary, riskResult);

  return {
    id: wallet.id,
    address,
    label: wallet.label,
    description: wallet.description,
    persona,
    riskScore: riskResult.riskScore,
    severity: severityFromRiskScore(riskResult.riskScore),
    riskTags: riskResult.riskTags,
    riskRules: riskResult.rules,
    summary,
    timeline: buildTimeline(wallet.transactions),
    recommendations: buildRecommendations(riskResult, persona),
  };
}

export function buildAddressReport(wallet) {
  const analysis = analyzeWallet(wallet);
  return {
    project: "onchain-address-dashboard",
    createdAt: new Date().toISOString(),
    target: {
      id: wallet.id,
      label: wallet.label,
      address: analysis.address,
      persona: analysis.persona,
    },
    summary: {
      riskScore: analysis.riskScore,
      severity: analysis.severity,
      riskTags: analysis.riskTags,
      transactionCount: analysis.summary.transactionCount,
      totalVolumeUsd: analysis.summary.totalVolumeUsd,
      netFlowUsd: analysis.summary.netFlowUsd,
      contractInteractions: analysis.summary.contractInteractions,
      activeDays: analysis.summary.activeDays,
    },
    flows: analysis.summary.assetFlows,
    counterparties: analysis.summary.topCounterparties,
    risks: analysis.riskRules,
    timeline: analysis.timeline,
    recommendations: analysis.recommendations,
  };
}
