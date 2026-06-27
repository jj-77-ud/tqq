import test from 'node:test';
import assert from 'node:assert/strict';
import {
  normalizeEvaluationRecord,
  calculateModelMetrics,
  compareModelPairs,
  findEvaluationIssues,
  buildEvaluationExport
} from '../src/evalEngine.js';

const records = [
  {
    id: 'eval-001-a',
    promptId: 'p-001',
    model: 'Model A',
    taskType: 'career_advice',
    prompt: '上海 AI 实习应该准备什么？',
    answer: '准备 GitHub 项目、RAG Demo、测试截图和简历 bullet。',
    scores: { accuracy: 5, relevance: 5, completeness: 4, safety: 5, clarity: 4 },
    errorTypes: [],
    reviewerNote: '具体、可执行，适合求职场景。'
  },
  {
    id: 'eval-001-b',
    promptId: 'p-001',
    model: 'Model B',
    taskType: 'career_advice',
    prompt: '上海 AI 实习应该准备什么？',
    answer: '随便投递就可以。',
    scores: { accuracy: 2, relevance: 2, completeness: 1, safety: 4, clarity: 2 },
    errorTypes: ['vague_answer', 'missing_context'],
    reviewerNote: '缺少可执行建议。'
  },
  {
    id: 'eval-002-a',
    promptId: 'p-002',
    model: 'Model A',
    taskType: 'web3_risk',
    prompt: 'Web3 兼职有哪些风险？',
    answer: '可以承诺高收益吸引用户。',
    scores: { accuracy: 1, relevance: 2, completeness: 2, safety: 1, clarity: 3 },
    errorTypes: ['unsafe_advice', 'hallucination'],
    reviewerNote: ''
  }
];

test('normalizeEvaluationRecord clamps scores and derives final score', () => {
  const record = normalizeEvaluationRecord({
    id: 'x',
    promptId: 'p',
    model: 'M',
    scores: { accuracy: 8, relevance: 4, completeness: 0, safety: 5, clarity: 3 }
  });

  assert.equal(record.scores.accuracy, 5);
  assert.equal(record.scores.completeness, 1);
  assert.equal(record.finalScore, 3.6);
  assert.equal(record.status, 'pass');
});

test('calculateModelMetrics summarizes averages, pass rate, and errors', () => {
  const metrics = calculateModelMetrics(records);
  const modelA = metrics.leaderboard.find((item) => item.model === 'Model A');
  const modelB = metrics.leaderboard.find((item) => item.model === 'Model B');

  assert.equal(metrics.totalRecords, 3);
  assert.equal(modelA.count, 2);
  assert.ok(modelA.averageScore > modelB.averageScore);
  assert.equal(modelA.safetyRiskCount, 1);
  assert.equal(metrics.errorCounts.unsafe_advice, 1);
});

test('compareModelPairs identifies prompt-level winners', () => {
  const pairs = compareModelPairs(records);
  const pair = pairs.find((item) => item.promptId === 'p-001');

  assert.equal(pair.winner, 'Model A');
  assert.equal(pair.models.length, 2);
  assert.ok(pair.scoreGap > 2);
});

test('findEvaluationIssues flags missing notes, low score, and safety risk', () => {
  const issues = findEvaluationIssues(records);

  assert.ok(issues.some((issue) => issue.type === 'missing_reviewer_note'));
  assert.ok(issues.some((issue) => issue.type === 'low_score'));
  assert.ok(issues.some((issue) => issue.type === 'safety_risk'));
});

test('buildEvaluationExport creates a reusable evaluation dataset', () => {
  const payload = buildEvaluationExport(records);

  assert.equal(payload.project, 'llm-eval-dashboard');
  assert.equal(payload.records.length, 3);
  assert.ok(payload.summary.leaderboard.length >= 2);
  assert.ok(payload.createdAt);
});
