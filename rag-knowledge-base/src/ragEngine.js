const GLOSSARY = [
  'AI 实习',
  'AI训练师',
  'AI 训练师',
  'RAG',
  'Web3',
  'JSON',
  'Prompt',
  '数据标注',
  '标注规范',
  '质检规则',
  '低质量样本',
  '偏好选择',
  '回答评分',
  '文本分类',
  '链上数据',
  '风控标注',
  '钱包安全',
  '合规内容',
  '项目作品',
  '检索增强生成'
];

const STOP_WORDS = new Set([
  'the',
  'and',
  'for',
  'with',
  'this',
  'that',
  'what',
  'should',
  'need',
  'helps',
  'projects',
  '什么',
  '需要',
  '应该',
  '如何',
  '一个',
  '可以',
  '相关',
  '准备'
]);

export function tokenize(input = '') {
  const text = String(input);
  const lower = text.toLowerCase();
  const tokens = new Set();

  for (const term of GLOSSARY) {
    if (lower.includes(term.toLowerCase())) {
      tokens.add(normalizeTerm(term));
    }
  }

  for (const match of lower.match(/[a-z0-9+#.]+/g) || []) {
    if (match.length > 1 && !STOP_WORDS.has(match)) {
      tokens.add(match);
    }
  }

  for (const match of text.match(/[\u4e00-\u9fa5]{2,}/g) || []) {
    if (!STOP_WORDS.has(match)) {
      tokens.add(match);
    }
    for (const gram of chineseNgrams(match)) {
      if (!STOP_WORDS.has(gram)) {
        tokens.add(gram);
      }
    }
  }

  return [...tokens];
}

export function chunkDocuments(documents, options = {}) {
  const maxLength = options.maxLength || 120;
  const chunks = [];

  for (const document of documents) {
    const sentences = splitSentences(document.content);
    let buffer = '';
    let index = 1;

    for (const sentence of sentences) {
      const candidate = buffer ? buffer + sentence : sentence;
      if (candidate.length > maxLength && buffer) {
        chunks.push(createChunk(document, buffer, index));
        index += 1;
        buffer = sentence;
      } else {
        buffer = candidate;
      }
    }

    if (buffer.trim()) {
      chunks.push(createChunk(document, buffer, index));
    }
  }

  return chunks;
}

export function retrieveRelevantChunks(question, chunks, options = {}) {
  const topK = options.topK || 4;
  const queryTokens = tokenize(question);
  const queryText = String(question).toLowerCase();

  return chunks
    .map((chunk) => scoreChunk(chunk, queryTokens, queryText))
    .filter((result) => result.score > 0)
    .sort((a, b) => b.score - a.score || a.sourceTitle.localeCompare(b.sourceTitle))
    .slice(0, topK);
}

export function generateAnswer(question, chunks, options = {}) {
  const evidence = retrieveRelevantChunks(question, chunks, options);
  const citations = evidence.map((item, index) => ({
    index: index + 1,
    sourceTitle: item.sourceTitle,
    chunkId: item.chunkId,
    score: item.score
  }));

  if (evidence.length === 0) {
    return {
      question,
      answer: '知识库里没有找到足够相关的依据。建议补充岗位 JD、标注规范或项目说明后再提问。',
      citations: [],
      evidence: []
    };
  }

  const opening = '根据知识库检索结果，可以优先参考：';
  const points = evidence.map((item, index) => {
    const summary = trimText(item.text, 90);
    return String(index + 1) + '. ' + item.sourceTitle + '：' + summary;
  });
  const advice = buildAdvice(question, evidence);

  return {
    question,
    answer: [opening, ...points, advice].join('\n'),
    citations,
    evidence
  };
}

export function buildQaExport(answerResult) {
  return {
    question: answerResult.question,
    answer: answerResult.answer,
    evidence: answerResult.evidence.map((item) => ({
      sourceTitle: item.sourceTitle,
      documentId: item.documentId,
      chunkId: item.chunkId,
      score: item.score,
      matchedTerms: item.matchedTerms,
      text: item.text
    })),
    citations: answerResult.citations,
    createdAt: new Date().toISOString()
  };
}

function scoreChunk(chunk, queryTokens, queryText) {
  const haystack = [chunk.sourceTitle, chunk.category, chunk.text].join(' ').toLowerCase();
  const chunkTokens = new Set(tokenize(haystack));
  const matchedTerms = [];
  let score = 0;

  for (const token of queryTokens) {
    if (chunkTokens.has(token)) {
      score += tokenWeight(token) + 1.2;
      matchedTerms.push(token);
      continue;
    }

    if (token.length >= 2 && haystack.includes(token)) {
      score += tokenWeight(token);
      matchedTerms.push(token);
    }
  }

  for (const phrase of GLOSSARY) {
    const normalized = normalizeTerm(phrase);
    if (queryText.includes(normalized.toLowerCase()) && haystack.includes(normalized.toLowerCase())) {
      score += 2.5;
      matchedTerms.push(normalized);
    }
  }

  if (chunk.category && queryText.includes(String(chunk.category).toLowerCase())) {
    score += 1;
  }

  const uniqueMatches = [...new Set(matchedTerms)];
  const normalizedScore = uniqueMatches.length === 0 ? 0 : score / Math.sqrt(Math.max(1, chunk.text.length / 60));

  return {
    ...chunk,
    score: Number(normalizedScore.toFixed(3)),
    matchedTerms: uniqueMatches
  };
}

function tokenWeight(token) {
  if (/^[a-z0-9+#.]+$/.test(token)) {
    return token.length <= 2 ? 1.1 : 1.7;
  }
  if (token.length >= 6) {
    return 2.2;
  }
  if (token.length >= 4) {
    return 1.6;
  }
  return 1;
}

function splitSentences(content = '') {
  return String(content)
    .split(/(?<=[。！？!?；;])\s*/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function createChunk(document, text, index) {
  return {
    id: document.id + '-' + index,
    chunkId: document.id + '-' + index,
    documentId: document.id,
    sourceTitle: document.title,
    category: document.category || 'general',
    text: text.trim()
  };
}

function chineseNgrams(text) {
  const grams = [];
  for (let size = 2; size <= 4; size += 1) {
    for (let index = 0; index <= text.length - size; index += 1) {
      grams.push(text.slice(index, index + size));
    }
  }
  return grams;
}

function normalizeTerm(term) {
  return String(term).replace(/\s+/g, ' ').trim();
}

function trimText(text, maxLength) {
  if (text.length <= maxLength) {
    return text;
  }
  return text.slice(0, maxLength - 1) + '...';
}

function buildAdvice(question, evidence) {
  const joined = evidence.map((item) => item.text).join(' ');
  const lowerQuestion = String(question).toLowerCase();

  if (joined.includes('数据标注') || joined.includes('AI 训练师')) {
    return '落地建议：把标注规范理解、质检意识、评分维度和 JSON 导出写进作品说明，这会贴近数据标注和 AI 训练兼职的真实要求。';
  }

  if (lowerQuestion.includes('web3') || joined.includes('Web3')) {
    return '落地建议：Web3 方向优先展示链上数据分析、风控标注和合规内容整理，避开代币推广、收益承诺和高风险交易相关岗位。';
  }

  return '落地建议：准备一个可运行 Demo、测试结果、截图和 README，并把它整理成简历中的项目经历。';
}
