import test from 'node:test';
import assert from 'node:assert/strict';
import {
  analyzeJobFit,
  generateOutreachMessage,
  planFollowUps,
  summarizePipeline,
  buildApplicationExport
} from '../src/applicationAgent.js';

const profile = {
  name: 'Student Candidate',
  targetCity: '上海',
  skills: ['JavaScript', 'Node.js', 'RAG', 'LLM Evaluation', 'Data Annotation', 'Web3 Risk'],
  projects: [
    { name: 'AI Resume Match', keywords: ['JD matching', 'resume optimization'] },
    { name: 'RAG Knowledge Base', keywords: ['RAG', 'citation'] },
    { name: 'LLM Eval Dashboard', keywords: ['model evaluation', 'data annotation'] }
  ]
};

const jobs = [
  {
    id: 'job-001',
    title: 'AI Product Intern',
    company: 'Shanghai AI Lab',
    city: '上海',
    status: 'not_applied',
    channel: 'Boss',
    postedAt: '2026-06-24',
    lastActionAt: '',
    jd: '需要 JavaScript、RAG、Prompt、AI 产品 Demo 和数据分析能力，负责 AI 应用原型和需求整理。'
  },
  {
    id: 'job-002',
    title: 'Web3 Growth Intern',
    company: 'Token Rocket',
    city: '远程',
    status: 'applied',
    channel: 'Telegram',
    postedAt: '2026-06-20',
    lastActionAt: '2026-06-23',
    jd: '需要推广代币、承诺收益、引导交易和社区拉新。'
  }
];

test('analyzeJobFit scores relevant AI jobs higher than risky Web3 growth jobs', () => {
  const aiFit = analyzeJobFit(jobs[0], profile);
  const riskyFit = analyzeJobFit(jobs[1], profile);

  assert.ok(aiFit.score > riskyFit.score);
  assert.ok(aiFit.matchedSkills.includes('RAG'));
  assert.ok(riskyFit.riskFlags.includes('token_promotion'));
  assert.equal(riskyFit.priority, 'low');
});

test('generateOutreachMessage creates a concise role-specific pitch', () => {
  const fit = analyzeJobFit(jobs[0], profile);
  const message = generateOutreachMessage(jobs[0], profile, fit);

  assert.ok(message.includes('Shanghai AI Lab'));
  assert.ok(message.includes('RAG Knowledge Base'));
  assert.ok(message.length < 360);
});

test('planFollowUps returns overdue and ready actions by status', () => {
  const actions = planFollowUps(jobs, profile, '2026-06-27');
  const appliedAction = actions.find((item) => item.jobId === 'job-002');

  assert.ok(appliedAction);
  assert.equal(appliedAction.actionType, 'follow_up');
  assert.equal(appliedAction.urgency, 'high');
});

test('summarizePipeline groups status and recommends next jobs', () => {
  const summary = summarizePipeline(jobs, profile, '2026-06-27');

  assert.equal(summary.totalJobs, 2);
  assert.equal(summary.byStatus.not_applied, 1);
  assert.equal(summary.byStatus.applied, 1);
  assert.equal(summary.topMatches[0].id, 'job-001');
});

test('buildApplicationExport creates an exportable application dataset', () => {
  const payload = buildApplicationExport(jobs, profile, '2026-06-27');

  assert.equal(payload.project, 'ai-internship-agent');
  assert.equal(payload.jobs.length, 2);
  assert.ok(payload.summary.topMatches.length > 0);
  assert.ok(payload.createdAt);
});
