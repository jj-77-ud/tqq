import test from 'node:test';
import assert from 'node:assert/strict';

import {
  buildExportDataset,
  calculateQualityMetrics,
  findAnnotationIssues,
  normalizeAnnotation
} from '../src/labelOps.js';

const annotations = [
  {
    id: 'txt-001',
    type: 'classification',
    label: '招聘',
    reason: '内容是岗位发布，包含职责和要求。'
  },
  {
    id: 'eval-001',
    type: 'response_evaluation',
    scores: {
      accuracy: 5,
      completeness: 4,
      safety: 5,
      expression: 4
    },
    reason: '回答准确完整，没有风险表达。'
  },
  {
    id: 'pref-001',
    type: 'preference',
    chosen: 'A',
    rejected: 'B',
    reason: 'A 更具体，有可执行步骤。'
  },
  {
    id: 'eval-002',
    type: 'response_evaluation',
    scores: {
      accuracy: 2,
      completeness: 2,
      safety: 4,
      expression: 3
    },
    reason: ''
  }
];

test('normalizeAnnotation creates stable records for classification tasks', () => {
  const normalized = normalizeAnnotation({
    id: 'txt-009',
    type: 'classification',
    label: '求职',
    reason: '候选人在描述求职目标。',
    annotator: 'student'
  });

  assert.equal(normalized.id, 'txt-009');
  assert.equal(normalized.type, 'classification');
  assert.equal(normalized.annotator, 'student');
  assert.equal(normalized.status, 'completed');
  assert.ok(normalized.updatedAt);
});

test('calculateQualityMetrics summarizes completion and quality signals', () => {
  const metrics = calculateQualityMetrics(annotations);

  assert.equal(metrics.total, 4);
  assert.equal(metrics.completed, 3);
  assert.equal(metrics.missingReason, 1);
  assert.equal(metrics.lowScore, 1);
  assert.equal(metrics.preference.A, 1);
  assert.equal(metrics.preference.B, 0);
  assert.equal(metrics.averageScore, 3.63);
});

test('findAnnotationIssues flags missing reasons and low score samples', () => {
  const issues = findAnnotationIssues(annotations);

  assert.deepEqual(issues.map((issue) => issue.id), ['eval-002', 'eval-002']);
  assert.ok(issues.some((issue) => issue.type === 'missing_reason'));
  assert.ok(issues.some((issue) => issue.type === 'low_score'));
});

test('buildExportDataset outputs training-friendly JSON records', () => {
  const dataset = buildExportDataset(annotations);

  assert.equal(dataset.length, 4);
  assert.deepEqual(Object.keys(dataset[0]), [
    'id',
    'taskType',
    'label',
    'scores',
    'chosen',
    'rejected',
    'reason',
    'qualityFlags'
  ]);
  assert.deepEqual(dataset[3].qualityFlags, ['missing_reason', 'low_score']);
});
