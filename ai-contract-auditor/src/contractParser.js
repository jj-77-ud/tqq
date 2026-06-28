export function normalizeSource(source = "") {
  return String(source).replace(/\r\n/g, "\n").trim();
}

export function getEvidenceLines(source, predicate) {
  return normalizeSource(source)
    .split("\n")
    .map((text, index) => ({
      lineNumber: index + 1,
      text,
      trimmed: text.trim(),
    }))
    .filter(predicate)
    .map((line) => `L${line.lineNumber}: ${line.trimmed}`);
}

function extractAll(source, regex) {
  const matches = [];
  for (const match of source.matchAll(regex)) {
    matches.push(match[1]);
  }
  return [...new Set(matches)];
}

function extractFunctions(source) {
  const lines = normalizeSource(source).split("\n");
  const functions = [];

  lines.forEach((line, index) => {
    const match = line.match(/function\s+([A-Za-z_][A-Za-z0-9_]*)\s*\([^)]*\)\s*([^;{]*)/);
    if (!match) {
      return;
    }

    const tail = match[2] || "";
    const visibility = tail.match(/\b(public|external|internal|private)\b/)?.[1] || "default";
    const modifiers = tail
      .split(/\s+/)
      .filter(Boolean)
      .filter((token) => !["public", "external", "internal", "private", "payable", "view", "pure", "returns"].includes(token))
      .map((token) => token.replace(/\(.*/, ""));

    functions.push({
      name: match[1],
      line: index + 1,
      signature: line.trim(),
      visibility,
      payable: /\bpayable\b/.test(tail),
      modifiers,
    });
  });

  return functions;
}

export function parseContractSource(source = "") {
  const normalized = normalizeSource(source);
  const functions = extractFunctions(normalized);
  const externalCallLines = getEvidenceLines(normalized, (line) =>
    /\.call\s*(\{|\()|\.transfer\s*\(|\.send\s*\(/.test(line.trimmed),
  );

  return {
    source: normalized,
    lineCount: normalized ? normalized.split("\n").length : 0,
    pragma: normalized.match(/pragma\s+solidity\s+([^;]+);/)?.[1]?.trim() || "unknown",
    contracts: extractAll(normalized, /\bcontract\s+([A-Za-z_][A-Za-z0-9_]*)/g),
    interfaces: extractAll(normalized, /\binterface\s+([A-Za-z_][A-Za-z0-9_]*)/g),
    modifiers: extractAll(normalized, /\bmodifier\s+([A-Za-z_][A-Za-z0-9_]*)/g),
    functions,
    payableFunctions: functions.filter((item) => item.payable).map((item) => item.name),
    externalCallLines,
    txOriginLines: getEvidenceLines(normalized, (line) => /\btx\.origin\b/.test(line.trimmed)),
    delegateCallLines: getEvidenceLines(normalized, (line) => /\.delegatecall\s*\(/.test(line.trimmed)),
    selfdestructLines: getEvidenceLines(normalized, (line) => /\bselfdestruct\s*\(|\bsuicide\s*\(/.test(line.trimmed)),
    randomnessLines: getEvidenceLines(normalized, (line) =>
      /block\.timestamp|blockhash\s*\(|block\.prevrandao|keccak256\s*\(/.test(line.trimmed),
    ),
    timestampLines: getEvidenceLines(normalized, (line) => /block\.timestamp|now\b/.test(line.trimmed)),
    requireLines: getEvidenceLines(normalized, (line) => /\brequire\s*\(/.test(line.trimmed)),
    stateUpdateLines: getEvidenceLines(normalized, (line) =>
      /(balances|balanceOf|owner|locked|status)\s*(\[.*\])?\s*=|\+=|-=/.test(line.trimmed),
    ),
  };
}
