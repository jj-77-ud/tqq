import test from 'node:test';
import assert from 'node:assert/strict';

import {
  buildAnalysisPrompt,
  createFallbackAnalysis,
  extractJsonObject,
  normalizeAnalysis
} from '../src/analyzer.js';

const sampleResume = `
上海某高校 计算机相关专业 大二学生
技术栈：Python、JavaScript、React、Node.js、Solidity
项目：做过课程管理系统和一个简单的智能合约练习
求职方向：AI应用开发 / Web3开发
`;

const sampleJd = `
AI应用开发实习生，要求熟悉 Python、React、API 对接，了解 RAG、Agent、Prompt Engineering。
加分项：了解区块链、Solidity、链上数据分析。
`;

test('buildAnalysisPrompt includes role, resume, and job description', () => {
  const prompt = buildAnalysisPrompt({
    resumeText: sampleResume,
    jdText: sampleJd,
    targetRole: 'AI+Web3'
  });

  assert.match(prompt, /AI\+Web3/);
  assert.match(prompt, /Python/);
  assert.match(prompt, /RAG/);
  assert.match(prompt, /JSON/);
});

test('createFallbackAnalysis returns a complete structured analysis', () => {
  const analysis = createFallbackAnalysis({
    resumeText: sampleResume,
    jdText: sampleJd,
    targetRole: 'AI+Web3'
  });

  assert.equal(analysis.targetRole, 'AI+Web3');
  assert.ok(analysis.matchScore >= 0);
  assert.ok(analysis.matchScore <= 100);
  assert.ok(analysis.matchedSkills.includes('Python'));
  assert.ok(analysis.matchedSkills.includes('React'));
  assert.ok(Array.isArray(analysis.missingSkills));
  assert.ok(analysis.resumeSuggestions.length >= 3);
  assert.ok(analysis.outreachMessage.length > 20);
});

test('extractJsonObject parses JSON wrapped in markdown text', () => {
  const content = `
下面是分析结果：
\`\`\`json
{
  "matchScore": 82,
  "targetRole": "AI",
  "matchedSkills": ["Python"],
  "missingSkills": ["RAG"],
  "resumeSuggestions": ["补充项目指标"],
  "projectSuggestions": ["做一个RAG demo"],
  "outreachMessage": "您好，我对该岗位很感兴趣。",
  "riskNotes": ["补充真实项目链接"]
}
\`\`\`
`;

  const parsed = extractJsonObject(content);
  assert.equal(parsed.matchScore, 82);
  assert.deepEqual(parsed.missingSkills, ['RAG']);
});

test('normalizeAnalysis fills invalid model output with safe defaults', () => {
  const normalized = normalizeAnalysis({
    matchScore: 180,
    matchedSkills: 'Python',
    outreachMessage: ''
  }, 'AI');

  assert.equal(normalized.matchScore, 100);
  assert.equal(normalized.targetRole, 'AI');
  assert.deepEqual(normalized.matchedSkills, ['Python']);
  assert.ok(normalized.resumeSuggestions.length > 0);
  assert.ok(normalized.outreachMessage.length > 0);
});
