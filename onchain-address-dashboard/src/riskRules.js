export const riskDefinitions = {
  "mixer-exposure": {
    label: "Mixer Exposure",
    severity: "High",
    score: 35,
    description: "Address interacted with a mixer-tagged counterparty.",
  },
  "phishing-counterparty": {
    label: "Phishing Counterparty",
    severity: "High",
    score: 35,
    description: "Address interacted with a phishing-tagged counterparty.",
  },
  "approval-risk": {
    label: "Approval Risk",
    severity: "Medium",
    score: 14,
    description: "Address has approval-like interactions with risky or unknown counterparties.",
  },
  "bridge-heavy": {
    label: "Bridge Heavy",
    severity: "Medium",
    score: 12,
    description: "Large share of activity routes through bridge contracts.",
  },
  "rapid-activity": {
    label: "Rapid Activity",
    severity: "Medium",
    score: 10,
    description: "Many transactions cluster in a short time window.",
  },
  dusting: {
    label: "Dusting",
    severity: "Low",
    score: 6,
    description: "Address received tiny unsolicited token transfers.",
  },
  "failed-transactions": {
    label: "Failed Transactions",
    severity: "Low",
    score: 8,
    description: "Failed transactions may indicate probing, drained allowance, or automation errors.",
  },
  "concentration-risk": {
    label: "Concentration Risk",
    severity: "Low",
    score: 6,
    description: "A single counterparty dominates wallet activity.",
  },
};

function countBy(transactions, predicate) {
  return transactions.filter(predicate).length;
}

function activeMinutes(transactions) {
  if (transactions.length < 2) {
    return 0;
  }
  const times = transactions.map((tx) => new Date(tx.timestamp).getTime()).sort((a, b) => a - b);
  return (times[times.length - 1] - times[0]) / 60000;
}

function topCounterpartyShare(summary) {
  const top = summary.topCounterparties[0];
  if (!top || summary.totalVolumeUsd === 0) {
    return 0;
  }
  return top.volumeUsd / summary.totalVolumeUsd;
}

export function evaluateRiskRules(transactions, summary) {
  const tags = [];
  const evidence = {};

  const mixer = transactions.filter((tx) => tx.counterpartyType === "mixer" || tx.labels.includes("mixer"));
  if (mixer.length) {
    tags.push("mixer-exposure");
    evidence["mixer-exposure"] = mixer.map((tx) => tx.hash);
  }

  const phishing = transactions.filter((tx) => tx.counterpartyType === "phishing" || tx.labels.includes("phishing"));
  if (phishing.length) {
    tags.push("phishing-counterparty");
    evidence["phishing-counterparty"] = phishing.map((tx) => tx.hash);
  }

  const approvals = transactions.filter((tx) => /approve|permit|setApproval/i.test(tx.method));
  if (approvals.length) {
    tags.push("approval-risk");
    evidence["approval-risk"] = approvals.map((tx) => tx.hash);
  }

  const bridgeCount = countBy(transactions, (tx) => tx.counterpartyType === "bridge" || /bridge/i.test(tx.method));
  if (bridgeCount >= 3 || bridgeCount / Math.max(transactions.length, 1) >= 0.35) {
    tags.push("bridge-heavy");
    evidence["bridge-heavy"] = transactions
      .filter((tx) => tx.counterpartyType === "bridge" || /bridge/i.test(tx.method))
      .map((tx) => tx.hash);
  }

  if (transactions.length >= 6 && activeMinutes(transactions) <= 90) {
    tags.push("rapid-activity");
    evidence["rapid-activity"] = transactions.map((tx) => tx.hash);
  }

  const dusting = transactions.filter((tx) => tx.labels.includes("dusting") || tx.amountUsd < 1);
  if (dusting.length) {
    tags.push("dusting");
    evidence.dusting = dusting.map((tx) => tx.hash);
  }

  const failed = transactions.filter((tx) => tx.failed);
  if (failed.length) {
    tags.push("failed-transactions");
    evidence["failed-transactions"] = failed.map((tx) => tx.hash);
  }

  if (topCounterpartyShare(summary) >= 0.55) {
    tags.push("concentration-risk");
    evidence["concentration-risk"] = [summary.topCounterparties[0].counterparty];
  }

  const uniqueTags = [...new Set(tags)];
  const riskScore = Math.min(
    100,
    uniqueTags.reduce((sum, tag) => sum + riskDefinitions[tag].score, 0),
  );

  return {
    riskScore,
    riskTags: uniqueTags,
    evidence,
    rules: uniqueTags.map((tag) => ({ id: tag, ...riskDefinitions[tag], evidence: evidence[tag] || [] })),
  };
}

export function severityFromRiskScore(score) {
  if (score >= 80) return "High";
  if (score >= 45) return "Medium";
  if (score >= 15) return "Low";
  return "Info";
}
