const STATUS_KEYS = ['not_applied', 'applied', 'follow_up', 'interviewing', 'rejected'];

const SKILL_ALIASES = {
  'JavaScript': ['javascript', 'js', '前端', '原生 js'],
  'Node.js': ['node', 'node.js', '后端', 'api'],
  'RAG': ['rag', '知识库', '检索增强', '引用来源'],
  'LLM Evaluation': ['llm eval', '模型评测', '评测', '评分'],
  'Data Annotation': ['数据标注', '标注', '质检', 'ai 训练师'],
  'Web3 Risk': ['web3', '风控', '链上', '合规', '钱包安全'],
  'Prompt': ['prompt', '提示词'],
  'Python': ['python']
};

const RISK_RULES = [
  { id: 'token_promotion', terms: ['推广代币', '代币推广', '引导交易', '承诺收益', '高收益'] },
  { id: 'unpaid_trial', terms: ['免费试用', '无薪', '先做完整项目'] },
  { id: 'vague_company', terms: ['保密项目', '不方便透露公司', '资金盘'] }
];

export function analyzeJobFit(job, profile) {
  const normalizedJob = normalizeJob(job);
  const jdText = [normalizedJob.title, normalizedJob.company, normalizedJob.city, normalizedJob.jd].join(' ');
  const lower = jdText.toLowerCase();
  const matchedSkills = [];

  for (const skill of profile.skills || []) {
    const aliases = SKILL_ALIASES[skill] || [skill];
    if (aliases.some((alias) => lower.includes(String(alias).toLowerCase()))) {
      matchedSkills.push(skill);
    }
  }

  const missingSkills = inferMissingSkills(lower, profile.skills || []);
  const riskFlags = findRiskFlags(lower);
  const cityBoost = normalizedJob.city.includes(profile.targetCity || '') ? 8 : 0;
  const statusPenalty = normalizedJob.status === 'rejected' ? 25 : 0;
  const riskPenalty = riskFlags.length * 28;
  const skillScore = matchedSkills.length * 11;
  const projectScore = countProjectMatches(lower, profile.projects || []) * 7;
  const rawScore = 34 + cityBoost + skillScore + projectScore - riskPenalty - statusPenalty - missingSkills.length * 4;
  const score = clamp(rawScore, 0, 100);
  const priority = getPriority(score, riskFlags, normalizedJob.status);

  return {
    id: normalizedJob.id,
    score,
    priority,
    matchedSkills,
    missingSkills,
    riskFlags,
    recommendedProjects: recommendProjects(lower, profile.projects || []),
    reasons: buildReasons(normalizedJob, matchedSkills, missingSkills, riskFlags, score)
  };
}

export function generateOutreachMessage(job, profile, fit = analyzeJobFit(job, profile)) {
  const normalizedJob = normalizeJob(job);
  const projectNames = fit.recommendedProjects.length > 0
    ? fit.recommendedProjects.map((project) => project.name)
    : (profile.projects || []).slice(0, 2).map((project) => project.name);
  const skillText = fit.matchedSkills.slice(0, 3).join('、') || 'AI 应用项目';

  return [
    '您好，我想投递 ' + normalizedJob.company + ' 的 ' + normalizedJob.title + '。',
    '我近期做了 ' + projectNames.slice(0, 2).join('、') + '，能展示 ' + skillText + ' 相关能力。',
    '如果方便，我可以发 GitHub 链接和 30 秒项目演示，期待进一步沟通。'
  ].join('');
}

export function planFollowUps(jobs, profile, currentDate = new Date().toISOString().slice(0, 10)) {
  return jobs
    .map((job) => {
      const normalizedJob = normalizeJob(job);
      const fit = analyzeJobFit(normalizedJob, profile);
      const daysSinceAction = daysBetween(normalizedJob.lastActionAt || normalizedJob.postedAt, currentDate);
      const action = buildAction(normalizedJob, fit, daysSinceAction);
      return action ? { ...action, jobId: normalizedJob.id, title: normalizedJob.title, company: normalizedJob.company, score: fit.score } : null;
    })
    .filter(Boolean)
    .sort((a, b) => urgencyRank(b.urgency) - urgencyRank(a.urgency) || b.score - a.score);
}

export function summarizePipeline(jobs, profile, currentDate = new Date().toISOString().slice(0, 10)) {
  const enriched = jobs.map((job) => {
    const fit = analyzeJobFit(job, profile);
    return { ...normalizeJob(job), fit, outreach: generateOutreachMessage(job, profile, fit) };
  });
  const byStatus = Object.fromEntries(STATUS_KEYS.map((status) => [status, 0]));
  for (const job of enriched) {
    byStatus[job.status] = (byStatus[job.status] || 0) + 1;
  }

  const activeJobs = enriched.filter((job) => job.status !== 'rejected');
  const topMatches = activeJobs
    .filter((job) => job.fit.priority !== 'low')
    .sort((a, b) => b.fit.score - a.fit.score)
    .slice(0, 4)
    .map((job) => ({ id: job.id, title: job.title, company: job.company, score: job.fit.score, priority: job.fit.priority }));

  return {
    totalJobs: enriched.length,
    byStatus,
    averageScore: average(enriched.map((job) => job.fit.score)),
    highPriorityCount: enriched.filter((job) => job.fit.priority === 'high').length,
    riskJobCount: enriched.filter((job) => job.fit.riskFlags.length > 0).length,
    topMatches,
    followUps: planFollowUps(enriched, profile, currentDate)
  };
}

export function buildApplicationExport(jobs, profile, currentDate = new Date().toISOString().slice(0, 10)) {
  const enrichedJobs = jobs.map((job) => {
    const fit = analyzeJobFit(job, profile);
    return {
      ...normalizeJob(job),
      fit,
      outreach: generateOutreachMessage(job, profile, fit)
    };
  });

  return {
    project: 'ai-internship-agent',
    createdAt: new Date().toISOString(),
    profile,
    jobs: enrichedJobs,
    summary: summarizePipeline(jobs, profile, currentDate),
    nextActions: planFollowUps(jobs, profile, currentDate)
  };
}

function normalizeJob(job) {
  return {
    id: String(job.id || crypto.randomUUID()),
    title: String(job.title || 'Untitled Role'),
    company: String(job.company || 'Unknown Company'),
    city: String(job.city || ''),
    status: STATUS_KEYS.includes(job.status) ? job.status : 'not_applied',
    channel: String(job.channel || 'unknown'),
    postedAt: String(job.postedAt || ''),
    lastActionAt: String(job.lastActionAt || ''),
    jd: String(job.jd || '')
  };
}

function inferMissingSkills(text, skills) {
  const desired = ['Python', 'Prompt', 'RAG', 'LLM Evaluation', 'Data Annotation', 'Web3 Risk', 'Node.js'];
  return desired.filter((skill) => {
    const aliases = SKILL_ALIASES[skill] || [skill];
    const appearsInJd = aliases.some((alias) => text.includes(String(alias).toLowerCase()));
    return appearsInJd && !skills.includes(skill);
  });
}

function findRiskFlags(text) {
  return RISK_RULES
    .filter((rule) => rule.terms.some((term) => text.includes(term.toLowerCase())))
    .map((rule) => rule.id);
}

function countProjectMatches(text, projects) {
  return recommendProjects(text, projects).length;
}

function recommendProjects(text, projects) {
  return projects.filter((project) => {
    const haystack = [project.name, ...(project.keywords || [])].join(' ').toLowerCase();
    return haystack.split(/\s+/).some((token) => token.length > 1 && text.includes(token));
  });
}

function buildReasons(job, matchedSkills, missingSkills, riskFlags, score) {
  const reasons = [];
  if (matchedSkills.length > 0) {
    reasons.push('命中能力：' + matchedSkills.slice(0, 4).join('、'));
  }
  if (missingSkills.length > 0) {
    reasons.push('可补强：' + missingSkills.join('、'));
  }
  if (riskFlags.length > 0) {
    reasons.push('需谨慎：' + riskFlags.join('、'));
  }
  if (score >= 75) {
    reasons.push('建议优先投递并准备项目演示。');
  } else if (score >= 55) {
    reasons.push('可投递，但需要定制话术。');
  } else {
    reasons.push('匹配度较低或风险较高，建议暂缓。');
  }
  if (job.city) {
    reasons.push('地点：' + job.city);
  }
  return reasons;
}

function getPriority(score, riskFlags, status) {
  if (status === 'rejected' || riskFlags.includes('token_promotion') || riskFlags.includes('vague_company')) {
    return 'low';
  }
  if (score >= 76) {
    return 'high';
  }
  if (score >= 56) {
    return 'medium';
  }
  return 'low';
}

function buildAction(job, fit, daysSinceAction) {
  if (job.status === 'not_applied' && fit.priority === 'high') {
    return {
      actionType: 'apply',
      urgency: 'high',
      message: '优先投递，并附上最匹配的 2 个项目。'
    };
  }
  if (job.status === 'applied' && daysSinceAction >= 3) {
    return {
      actionType: 'follow_up',
      urgency: daysSinceAction >= 3 ? 'high' : 'medium',
      message: '已投递 ' + daysSinceAction + ' 天，建议发送一次礼貌跟进。'
    };
  }
  if (job.status === 'follow_up') {
    return {
      actionType: 'prepare_interview',
      urgency: 'medium',
      message: '准备 30 秒项目演示和岗位匹配说明。'
    };
  }
  if (job.status === 'interviewing') {
    return {
      actionType: 'interview_checklist',
      urgency: 'high',
      message: '整理项目截图、GitHub 链接和可讲的技术细节。'
    };
  }
  return null;
}

function daysBetween(startDate, endDate) {
  if (!startDate || !endDate) {
    return 0;
  }
  const start = new Date(startDate + 'T00:00:00');
  const end = new Date(endDate + 'T00:00:00');
  const diff = end.getTime() - start.getTime();
  if (!Number.isFinite(diff)) {
    return 0;
  }
  return Math.max(0, Math.floor(diff / 86400000));
}

function average(values) {
  if (values.length === 0) {
    return 0;
  }
  return Number((values.reduce((sum, value) => sum + value, 0) / values.length).toFixed(2));
}

function urgencyRank(value) {
  return { low: 1, medium: 2, high: 3 }[value] || 0;
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, Math.round(value)));
}
