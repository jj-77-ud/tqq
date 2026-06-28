import { parseContractSource, normalizeSource } from "./contractParser.js";

const severityWeight = {
  Critical: 100,
  High: 80,
  Medium: 25,
  Low: 8,
  Info: 2,
};

function createFinding({ id, title, severity, category, description, evidence, recommendations, tags }) {
  return {
    id,
    title,
    severity,
    category,
    description,
    evidence: evidence.filter(Boolean),
    recommendations,
    tags,
    confidence: evidence.length > 0 ? "High" : "Medium",
  };
}

function hasBalanceUpdateAfterExternalCall(source) {
  const lines = normalizeSource(source).split("\n");
  const callIndex = lines.findIndex((line) => /\.call\s*\{\s*value|\.call\s*\(/.test(line));
  const updateIndex = lines.findIndex((line, index) =>
    index > callIndex && /(balances|balanceOf)\s*\[.*\]\s*=\s*0/.test(line),
  );
  return callIndex >= 0 && updateIndex > callIndex;
}

function detectReentrancy(parsed) {
  if (!parsed.externalCallLines.length || !hasBalanceUpdateAfterExternalCall(parsed.source)) {
    return null;
  }

  return createFinding({
    id: "REENTRANCY-001",
    title: "External call before state update",
    severity: "High",
    category: "Funds Safety",
    description:
      "The contract sends ETH through a low-level call before clearing the sender balance, allowing a malicious receiver to re-enter withdraw().",
    evidence: parsed.externalCallLines,
    recommendations: [
      "Apply Checks-Effects-Interactions",
      "Set user balance to zero before sending ETH",
      "Add a nonReentrant guard to withdraw-style functions",
    ],
    tags: ["reentrancy", "external-call"],
  });
}

function detectTxOrigin(parsed) {
  if (!parsed.txOriginLines.length) {
    return null;
  }

  return createFinding({
    id: "AUTH-001",
    title: "tx.origin authorization",
    severity: "High",
    category: "Access Control",
    description:
      "Using tx.origin for authorization can be abused through phishing contracts; msg.sender or role-based access control is safer.",
    evidence: parsed.txOriginLines,
    recommendations: [
      "Replace tx.origin checks with msg.sender",
      "Use Ownable or role-based access control",
      "Add tests with an intermediate caller contract",
    ],
    tags: ["authorization-risk"],
  });
}

function detectWeakRandomness(parsed) {
  const evidence = parsed.randomnessLines.filter((line) =>
    /block\.timestamp|blockhash|keccak256/.test(line),
  );
  if (!evidence.length || !/winner|random|lottery|draw|index/i.test(parsed.source)) {
    return null;
  }

  return createFinding({
    id: "RANDOMNESS-001",
    title: "Predictable on-chain randomness",
    severity: "Medium",
    category: "Fairness",
    description:
      "Block timestamp and blockhash are miner/validator-influenced inputs and should not decide valuable randomness.",
    evidence,
    recommendations: [
      "Use a verifiable randomness oracle",
      "Separate commit and reveal phases",
      "Avoid timestamp-only or blockhash-only winner selection",
    ],
    tags: ["randomness-risk"],
  });
}

function detectDelegateCall(parsed) {
  if (!parsed.delegateCallLines.length) {
    return null;
  }

  return createFinding({
    id: "DELEGATECALL-001",
    title: "Unsafe delegatecall surface",
    severity: "High",
    category: "Upgrade Safety",
    description:
      "delegatecall executes foreign code in the caller storage context and can overwrite critical state if not tightly controlled.",
    evidence: parsed.delegateCallLines,
    recommendations: [
      "Restrict implementation addresses through governance",
      "Validate storage layout before upgrades",
      "Emit upgrade events and test malicious implementations",
    ],
    tags: ["delegatecall-risk"],
  });
}

function detectSelfdestruct(parsed) {
  if (!parsed.selfdestructLines.length) {
    return null;
  }

  return createFinding({
    id: "LIFECYCLE-001",
    title: "Destructive contract lifecycle",
    severity: "Medium",
    category: "Availability",
    description:
      "selfdestruct can permanently disable contract behavior and should be avoided unless the lifecycle is explicitly designed.",
    evidence: parsed.selfdestructLines,
    recommendations: [
      "Remove selfdestruct in production contracts",
      "If shutdown is required, gate it with timelock governance",
      "Document emergency assumptions",
    ],
    tags: ["availability-risk"],
  });
}

function detectOldPragma(parsed) {
  const match = parsed.pragma.match(/\^?([0-9]+)\.([0-9]+)\.([0-9]+)/);
  if (!match) {
    return null;
  }

  const major = Number(match[1]);
  const minor = Number(match[2]);
  if (major > 0 || minor >= 8) {
    return null;
  }

  return createFinding({
    id: "COMPILER-001",
    title: "Old Solidity compiler range",
    severity: "Medium",
    category: "Compiler Safety",
    description:
      "Solidity versions below 0.8 do not include default overflow and underflow checks.",
    evidence: [`pragma solidity ${parsed.pragma};`],
    recommendations: [
      "Upgrade to Solidity 0.8.x or later",
      "Add arithmetic tests for boundary values",
      "Review SafeMath usage during migration",
    ],
    tags: ["compiler-risk"],
  });
}

function detectMissingAccessControl(parsed) {
  const sensitive = parsed.functions.filter((fn) =>
    /mint|burn|pause|unpause|set|upgrade|sweep|withdrawAll|emergency/i.test(fn.name),
  );
  const guarded = parsed.requireLines.some((line) => /msg\.sender|onlyOwner|hasRole|owner/.test(line));
  const evidence = sensitive.map((fn) => `L${fn.line}: ${fn.signature}`);

  if (!sensitive.length || guarded) {
    return null;
  }

  return createFinding({
    id: "ACCESS-001",
    title: "Sensitive function lacks visible access control",
    severity: "Medium",
    category: "Access Control",
    description:
      "A sensitive external/public function appears without an owner, role, or sender check in nearby source.",
    evidence,
    recommendations: [
      "Add onlyOwner or role-based access control",
      "Limit emergency and upgrade functions to trusted roles",
      "Add unauthorized caller tests",
    ],
    tags: ["access-control"],
  });
}

function collectTags(findings) {
  return [...new Set(findings.flatMap((finding) => finding.tags))];
}

function riskScore(findings) {
  const score = findings.reduce((sum, finding) => sum + severityWeight[finding.severity], 0);
  return Math.min(100, score);
}

function severityFromScore(score, findings) {
  if (findings.some((finding) => finding.severity === "Critical") || score >= 95) {
    return "Critical";
  }
  if (findings.some((finding) => finding.severity === "High") || score >= 70) {
    return "High";
  }
  if (findings.some((finding) => finding.severity === "Medium") || score >= 30) {
    return "Medium";
  }
  if (findings.length) {
    return "Low";
  }
  return "Info";
}

export function auditContract(source = "", options = {}) {
  const parsed = parseContractSource(source);
  const detectors = [
    detectReentrancy,
    detectTxOrigin,
    detectWeakRandomness,
    detectDelegateCall,
    detectSelfdestruct,
    detectOldPragma,
    detectMissingAccessControl,
  ];
  const findings = detectors.map((detector) => detector(parsed)).filter(Boolean);
  const score = riskScore(findings);

  return {
    title: options.title || parsed.contracts[0] || "Untitled Contract",
    riskScore: score,
    overallSeverity: severityFromScore(score, findings),
    tags: collectTags(findings),
    findings,
    parsed: {
      pragma: parsed.pragma,
      contracts: parsed.contracts,
      interfaces: parsed.interfaces,
      modifiers: parsed.modifiers,
      functions: parsed.functions,
      payableFunctions: parsed.payableFunctions,
      lineCount: parsed.lineCount,
    },
    quickWins: [
      "Review every external call and update state before interaction",
      "Replace owner checks based on tx.origin",
      "Write malicious receiver tests for payable withdraw flows",
    ],
  };
}

export function buildAuditReport(source = "", options = {}) {
  const audit = auditContract(source, options);
  const severityBuckets = audit.findings.reduce((bucket, finding) => {
    bucket[finding.severity] = (bucket[finding.severity] || 0) + 1;
    return bucket;
  }, {});

  return {
    project: "ai-contract-auditor",
    createdAt: new Date().toISOString(),
    target: {
      title: audit.title,
      contracts: audit.parsed.contracts,
      pragma: audit.parsed.pragma,
      lineCount: audit.parsed.lineCount,
      functionCount: audit.parsed.functions.length,
    },
    summary: {
      riskScore: audit.riskScore,
      overallSeverity: audit.overallSeverity,
      findingCount: audit.findings.length,
      severityBuckets,
      tags: audit.tags,
    },
    findings: audit.findings,
    reviewPlan: [
      "Confirm the exploit path with a minimal malicious contract test.",
      "Apply the recommended patch and rerun the same scenario.",
      "Review access-control assumptions with the product owner.",
      "Document accepted risks before deployment.",
    ],
    quickWins: audit.quickWins,
  };
}

export function buildLLMPrompt(report) {
  const findings = report.findings
    .map((finding) => `- ${finding.id} [${finding.severity}]: ${finding.title}`)
    .join("\n");

  return `You are a Solidity security auditor. Review the contract findings below and produce a patch-focused audit response.

Target: ${report.target.title}
Overall severity: ${report.summary.overallSeverity}
Risk score: ${report.summary.riskScore}

Findings:
${findings || "- No findings from the local rule engine."}

Please explain exploitability, false-positive checks, and concrete patch suggestions.`;
}
