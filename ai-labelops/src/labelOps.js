export function normalizeAnnotation(annotation) {
  const now = new Date().toISOString();
  const normalized = {
    id: String(annotation.id || crypto.randomUUID()),
    type: String(annotation.type || 'classification'),
    annotator: String(annotation.annotator || 'demo-annotator'),
    label: annotation.label || '',
    scores: normalizeScores(annotation.scores),
    chosen: annotation.chosen || '',
    rejected: annotation.rejected || '',
    reason: String(annotation.reason || '').trim(),
    updatedAt: annotation.updatedAt || now
  };

  normalized.status = isAnnotationComplete(normalized) ? 'completed' : 'needs_review';
  return normalized;
}

export function calculateQualityMetrics(annotations) {
  const normalized = annotations.map(normalizeAnnotation);
  const scoreValues = normalized.flatMap((item) => Object.values(item.scores));
  const preference = normalized.reduce((totals, item) => {
    if (item.type === 'preference' && item.chosen) {
      totals[item.chosen] = (totals[item.chosen] || 0) + 1;
    }
    return totals;
  }, { A: 0, B: 0, tie: 0 });

  return {
    total: normalized.length,
    completed: normalized.filter((item) => item.status === 'completed').length,
    missingReason: normalized.filter((item) => !item.reason).length,
    lowScore: normalized.filter(hasLowScore).length,
    averageScore: roundAverage(scoreValues),
    preference,
    byType: countBy(normalized, 'type')
  };
}

export function findAnnotationIssues(annotations) {
  const issues = [];

  for (const annotation of annotations.map(normalizeAnnotation)) {
    if (!annotation.reason) {
      issues.push({
        id: annotation.id,
        type: 'missing_reason',
        message: '缺少标注理由，质检时需要补充判断依据。'
      });
    }

    if (hasLowScore(annotation)) {
      issues.push({
        id: annotation.id,
        type: 'low_score',
        message: '评分均值低于 3，需要复核样本或补充高质量回答。'
      });
    }
  }

  return issues;
}

export function buildExportDataset(annotations) {
  const issuesById = groupIssuesById(findAnnotationIssues(annotations));

  return annotations.map((annotation) => {
    const normalized = normalizeAnnotation(annotation);
    return {
      id: normalized.id,
      taskType: normalized.type,
      label: normalized.label,
      scores: normalized.scores,
      chosen: normalized.chosen,
      rejected: normalized.rejected,
      reason: normalized.reason,
      qualityFlags: issuesById.get(normalized.id) || []
    };
  });
}

function normalizeScores(scores = {}) {
  const allowed = ['accuracy', 'completeness', 'safety', 'expression'];
  return Object.fromEntries(
    allowed
      .filter((key) => Number.isFinite(Number(scores[key])))
      .map((key) => [key, clampScore(scores[key])])
  );
}

function clampScore(value) {
  return Math.max(1, Math.min(5, Number(value)));
}

function isAnnotationComplete(annotation) {
  if (!annotation.reason) {
    return false;
  }

  if (annotation.type === 'classification') {
    return Boolean(annotation.label);
  }

  if (annotation.type === 'response_evaluation') {
    return Object.keys(annotation.scores).length === 4;
  }

  if (annotation.type === 'preference') {
    return Boolean(annotation.chosen && annotation.rejected);
  }

  return false;
}

function hasLowScore(annotation) {
  const values = Object.values(annotation.scores);
  return values.length > 0 && roundAverage(values) < 3;
}

function roundAverage(values) {
  if (!values.length) {
    return 0;
  }

  const total = values.reduce((sum, value) => sum + Number(value), 0);
  return Number((total / values.length).toFixed(2));
}

function countBy(items, key) {
  return items.reduce((totals, item) => {
    totals[item[key]] = (totals[item[key]] || 0) + 1;
    return totals;
  }, {});
}

function groupIssuesById(issues) {
  const groups = new Map();

  for (const issue of issues) {
    const flags = groups.get(issue.id) || [];
    flags.push(issue.type);
    groups.set(issue.id, flags);
  }

  return groups;
}
