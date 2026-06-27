import test from 'node:test';
import assert from 'node:assert/strict';
import {
  tokenize,
  chunkDocuments,
  retrieveRelevantChunks,
  generateAnswer,
  buildQaExport
} from '../src/ragEngine.js';

const documents = [
  {
    id: 'ai-internship',
    title: 'AI Internship Preparation',
    category: 'career',
    content: 'AI 实习岗位通常要求掌握 JavaScript、Python、Prompt 设计、RAG 检索增强生成和基础模型评测。项目作品需要展示可运行 Demo、测试和清晰 README。'
  },
  {
    id: 'data-labeling',
    title: 'Data Annotation Guideline',
    category: 'training',
    content: '数据标注兼职需要理解标注规范、质检规则、低质量样本识别和 JSON 数据导出。AI 训练师常见任务包括文本分类、回答评分和偏好选择。'
  },
  {
    id: 'web3-risk',
    title: 'Web3 Risk Note',
    category: 'web3',
    content: 'Web3 相关兼职应避开代币推广和高风险交易承诺，更适合选择链上数据分析、风控标注、钱包安全知识整理和合规内容审核。'
  }
];

test('tokenize keeps useful Chinese and English terms', () => {
  const tokens = tokenize('RAG 检索增强生成 helps AI internship projects.');
  assert.ok(tokens.includes('rag'));
  assert.ok(tokens.includes('检索增强生成'));
  assert.ok(tokens.includes('ai'));
  assert.ok(tokens.includes('internship'));
});

test('chunkDocuments creates searchable chunks with source metadata', () => {
  const chunks = chunkDocuments(documents, { maxLength: 45 });
  assert.ok(chunks.length >= documents.length);
  assert.equal(chunks[0].documentId, 'ai-internship');
  assert.equal(chunks[0].sourceTitle, 'AI Internship Preparation');
  assert.ok(chunks[0].text.length > 0);
});

test('retrieveRelevantChunks ranks data annotation content for labeling questions', () => {
  const chunks = chunkDocuments(documents, { maxLength: 80 });
  const results = retrieveRelevantChunks('数据标注兼职需要准备什么能力？', chunks, { topK: 2 });
  assert.equal(results[0].documentId, 'data-labeling');
  assert.ok(results[0].score > 0);
  assert.ok(results[0].matchedTerms.includes('数据标注') || results[0].matchedTerms.includes('标注'));
});

test('generateAnswer returns cited answer and evidence', () => {
  const chunks = chunkDocuments(documents, { maxLength: 80 });
  const answer = generateAnswer('上海找 AI 实习应该准备什么项目？', chunks, { topK: 3 });
  assert.ok(answer.answer.includes('AI Internship Preparation'));
  assert.ok(answer.citations.length > 0);
  assert.ok(answer.evidence.every((item) => typeof item.score === 'number'));
});

test('buildQaExport produces a training-friendly JSON record', () => {
  const chunks = chunkDocuments(documents, { maxLength: 80 });
  const answer = generateAnswer('Web3 兼职有什么风险？', chunks, { topK: 2 });
  const record = buildQaExport(answer);
  assert.equal(record.question, 'Web3 兼职有什么风险？');
  assert.ok(Array.isArray(record.evidence));
  assert.ok(record.evidence[0].sourceTitle);
  assert.ok(record.createdAt);
});
