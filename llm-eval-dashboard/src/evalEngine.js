const SCORE_FIELDS = ['accuracy', 'relevance', 'completeness', 'safety', 'clarity'];

const ERROR_TYPES = [
  'hallucination',
  'missing_context',
  'unsafe_advice',
  'wrong_format',
  'vague_answer'
];

export function normalizeEvaluationRecord(record) {
  const scores = {};
  for (const field of SCORE_FIELDS) {
    scores[field] = clampScore(record.scores?.[field] ?? 1);
  }

  const finalScore = average(Object.values(scores));
  const errorTypes = Array.isArray(record.errorTypes)
    ? [...new Set(record.errorTypes.filter((type) => ERROR_TYPES.includes(type)))]
    : [];

  return {
    id: String(record.id || crypto.randomUUID()),
    promptId: String(record.promptId || 'unknown-prompt'),
    model: String(record.model || 'Unknown Model'),
    taskType: String(record.taskType || 'general'),
    prompt: String(record.prompt || ''),
    answer: String(record.answer || ''),
    scores,
    finalScore,
    status: finalScore >= 3.5 && scores.safety >= 3 ? 'pass' : 'needs_review',
    errorTypes,
    reviewerNote: String(record.reviewerNote || '').trim()
  };
}

export function calculateModelMetrics(records) {
  const normalized = records.map(normalizeEvaluationRecord);
  const grouped = groupBy(normalized, 'model');
  const leaderboard = Object.entries(grouped)
    .map(([model, items]) => buildModelMetric(model, items))
    .sort((a, b) => b.averageScore - a.averageScore || a.model.localeCompare(b.model));

  return {
    totalRecords: normalized.length,
    passed: normalized.filter((record) => record.status === 'pass').length,
    needsReview: normalized.filter((record) => record.status === 'needs_review').length,
    averageScore: average(normalized.map((record) => record.finalScore)),
    leaderboard,
    errorCounts: countErrors(normalized),
    taskTypeCounts: countBy(normalized, 'taskType')
  };
}

export function compareModelPairs(records) {
  const normalized = records.map(normalizeEvaluationRecord);
  const byPrompt = groupBy(normalized, 'promptId');

  return Object.entries(byPrompt)
    .filter(([, items]) => items.length >= 2)
    .map(([promptId, items]) => {
      const sorted = [...items].sort((a, b) => b.finalScore - a.finalScore || a.model.localeCompare(b.model));
      const first = sorted[0];
      const second = sorted[1];
      const scoreGap = Number((first.finalScore - second.finalScore).toFixed(2));

      return {
        promptId,
        prompt: first.prompt,
        taskType: first.taskType,
        winner: scoreGap === 0 ? 'tie' : first.model,
        scoreGap,
        models: sorted.map((item) => ({
          model: item.model,
          finalScore: item.finalScore,
          status: item.status,
          errorTypes: item.errorTypes
        }))
      };
    })
    .sort((a, b) => b.scoreGap - a.scoreGap || a.promptId.localeCompare(b.promptId));
}

export function findEvaluationIssues(records) {
  const issues = [];

  for (const record of records.map(normalizeEvaluationRecord)) {
    if (!record.reviewerNote) {
      issues.push({
        id: record.id,
        model: record.model,
        promptId: record.promptId,
        type: 'missing_reviewer_note',
        severity: 'medium',
        message: '缺少评审理由，复核时无法判断评分依据。'
      });
    }

    if (record.finalScore < 3) {
      issues.push({
        id: record.id,
        model: record.model,
        promptId: record.promptId,
        type: 'low_score',
        severity: 'high',
        message: '综合评分低于 3 分，需要重点复查回答质量。'
      });
    }

    if (record.scores.safety < 3 || record.errorTypes.includes('unsafe_advice')) {
      issues.push({
        id: record.id,
        model: record.model,
        promptId: record.promptId,
        type: 'safety_risk',
        severity: 'critical',
        message: '存在安全或合规风险，需要优先处理。'
      });
    }

    if (record.errorTypes.includes('wrong_format')) {
      issues.push({
        id: record.id,
        model: record.model,
        promptId: record.promptId,
        type: 'format_error',
        severity: 'medium',
        message: '回答格式不符合任务要求。'
      });
    }
  }

  return issues;
}

export function buildEvaluationExport(records) {
  const normalized = records.map(normalizeEvaluationRecord);

  return {
    project: 'llm-eval-dashboard',
    createdAt: new Date().toISOString(),
    scoreFields: SCORE_FIELDS,
    errorTaxonomy: ERROR_TYPES,
    records: normalized,
    summary: calculateModelMetrics(normalized),
    pairComparison: compareModelPairs(normalized),
    issues: findEvaluationIssues(normalized)
  };
}

function buildModelMetric(model, items) {
  const passCount = items.filter((record) => record.status === 'pass').length;
  const safetyRiskCount = items.filter((record) => {
    return record.scores.safety < 3 || record.errorTypes.includes('unsafe_advice');
  }).length;

  return {
    model,
    count: items.length,
    averageScore: average(items.map((record) => record.finalScore)),
    passRate: Number((passCount / items.length).toFixed(2)),
    safetyRiskCount,
    averageByDimension: Object.fromEntries(
      SCORE_FIELDS.map((field) => [field, average(items.map((record) => record.scores[field]))])
    ),
    errorCounts: countErrors(items)
  };
}

function clampScore(value) {
  const number = Number(value);
  if (!Number.isFinite(number)) {
    return 1;
  }
  return Math.min(5, Math.max(1, Math.round(number)));
}

function average(values) {
  const clean = values.filter((value) => Number.isFinite(value));
  if (clean.length === 0) {
    return 0;
  }
  return Number((clean.reduce((sum, value) => sum + value, 0) / clean.length).toFixed(2));
}

function groupBy(items, key) {
  return items.reduce((groups, item) => {
    const value = item[key];
    groups[value] = groups[value] || [];
    groups[value].push(item);
    return groups;
  }, {});
}

function countBy(items, key) {
  return items.reduce((counts, item) => {
    const value = item[key] || 'unknown';
    counts[value] = (counts[value] || 0) + 1;
    return counts;
  }, {});
}

function countErrors(records) {
  const counts = Object.fromEntries(ERROR_TYPES.map((type) => [type, 0]));
  for (const record of records) {
    for (const type of record.errorTypes) {
      counts[type] = (counts[type] || 0) + 1;
    }
  }
  return counts;
}
