const SKILL_KEYWORDS = [
  'Python',
  'JavaScript',
  'TypeScript',
  'React',
  'Next.js',
  'Node.js',
  'FastAPI',
  'SQL',
  'RAG',
  'Agent',
  'Prompt Engineering',
  'Embedding',
  'Vector Database',
  'LangChain',
  'LlamaIndex',
  'Solidity',
  'Ethers',
  'Viem',
  'Foundry',
  'Hardhat',
  'Smart Contract',
  'On-chain Data',
  'Web3'
];

const DEFAULT_ARRAYS = {
  matchedSkills: [],
  missingSkills: ['RAG', 'Agent', '项目量化指标'],
  resumeSuggestions: [
    '把课程项目改写成“问题-方案-结果”的结构，补充技术栈和可验证成果。',
    '增加一个可访问的 GitHub 仓库链接，并在 README 中放截图和运行方式。',
    '针对目标岗位补充 2-3 个关键词，例如 RAG、API 对接、模型评测或 Solidity。'
  ],
  projectSuggestions: [
    '完成一个 AI 简历-JD 匹配器，展示 Prompt 设计、结构化输出和前端渲染能力。',
    '补充一个 RAG 知识库问答 demo，展示文档处理、检索和引用来源。',
    '做一个链上数据看板或智能合约审计助手，体现 AI + Web3 的交叉能力。'
  ],
  riskNotes: [
    '避免在简历中写无法证明的“精通”，优先写可运行项目和可验证链接。',
    'Web3 方向应强调区块链技术、合约安全和链上数据，避免交易、拉新、返佣等高风险表述。'
  ]
};

export function buildAnalysisPrompt({ resumeText, jdText, targetRole }) {
  return `
你是一名上海地区 AI/Web3 暑期实习求职顾问。请基于候选人简历和岗位 JD，输出严格 JSON，不要输出 Markdown。

目标方向：${targetRole}

候选人简历：
${resumeText}

岗位 JD：
${jdText}

请返回以下 JSON 字段：
{
  "matchScore": 0到100的整数,
  "targetRole": "目标方向",
  "summary": "一句话总结匹配情况",
  "matchedSkills": ["命中的技能"],
  "missingSkills": ["缺失或薄弱技能"],
  "resumeSuggestions": ["简历修改建议，至少3条"],
  "projectSuggestions": ["短期补强项目建议，至少3条"],
  "outreachMessage": "可直接发给招聘方的中文投递话术",
  "riskNotes": ["求职风险或表达风险提醒"]
}

要求：
- 以实习生水平判断，不要过度苛刻。
- 优先关注 AI 应用开发、RAG、Agent、API 对接、前端展示、Web3 技术工具。
- 如果 Web3 岗位涉及交易、返佣、喊单、拉新，请提醒合规风险。
- JSON 必须可被 JSON.parse 解析。
`;
}

export function extractJsonObject(content) {
  if (!content || typeof content !== 'string') {
    throw new Error('Model response is empty.');
  }

  const fenced = content.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  const candidate = fenced ? fenced[1] : content;
  const firstBrace = candidate.indexOf('{');
  const lastBrace = candidate.lastIndexOf('}');

  if (firstBrace === -1 || lastBrace === -1 || firstBrace >= lastBrace) {
    throw new Error('No JSON object found in model response.');
  }

  return JSON.parse(candidate.slice(firstBrace, lastBrace + 1));
}

export function normalizeAnalysis(raw, targetRole = 'AI+Web3') {
  const safe = raw && typeof raw === 'object' ? raw : {};
  const score = Number.isFinite(Number(safe.matchScore)) ? Number(safe.matchScore) : 60;
  const matchScore = Math.max(0, Math.min(100, Math.round(score)));

  return {
    matchScore,
    targetRole: asText(safe.targetRole) || targetRole,
    summary: asText(safe.summary) || buildDefaultSummary(matchScore),
    matchedSkills: asStringArray(safe.matchedSkills),
    missingSkills: withDefaultArray(safe.missingSkills, DEFAULT_ARRAYS.missingSkills),
    resumeSuggestions: withDefaultArray(safe.resumeSuggestions, DEFAULT_ARRAYS.resumeSuggestions),
    projectSuggestions: withDefaultArray(safe.projectSuggestions, DEFAULT_ARRAYS.projectSuggestions),
    outreachMessage: asText(safe.outreachMessage) || buildDefaultOutreach(targetRole),
    riskNotes: withDefaultArray(safe.riskNotes, DEFAULT_ARRAYS.riskNotes)
  };
}

export function createFallbackAnalysis({ resumeText, jdText, targetRole }) {
  const matchedSkills = findMatchedSkills(resumeText, jdText);
  const missingSkills = findMissingSkills(resumeText, jdText);
  const score = calculateScore(matchedSkills, missingSkills, resumeText);

  return normalizeAnalysis({
    matchScore: score,
    targetRole,
    summary: `当前简历与 ${targetRole} 岗位有一定匹配度，优势在 ${matchedSkills.slice(0, 3).join('、') || '基础技术栈'}，短板主要是项目证明和岗位关键词覆盖。`,
    matchedSkills,
    missingSkills,
    resumeSuggestions: [
      '把每段经历改成“做了什么、用了什么技术、产出什么结果”的三段式表达。',
      '增加可访问作品链接：GitHub、在线 demo、截图或一页项目说明。',
      `围绕 ${targetRole} 岗位补充关键词，尤其是 JD 中出现但简历没有出现的能力。`,
      '把“了解/学习过”改成具体动作，例如“实现 API 调用”“完成前端结果渲染”“编写合约测试”。'
    ],
    projectSuggestions: [
      '当天完成 AI 简历-JD 匹配器，用结构化 Prompt 输出匹配分和建议。',
      '第二天完成 RAG 知识库问答，展示文档解析、检索和引用来源。',
      '补一个 Web3 小项目：链上地址分析看板或 Solidity 漏洞修复测试。'
    ],
    outreachMessage: `您好，我正在寻找上海地区 ${targetRole} 方向暑期实习/兼职机会。我做过前端与脚本开发基础练习，正在补充 AI 应用和 Web3 技术作品，能快速完成 demo、接入 API、整理数据并写清楚项目文档。希望有机会进一步沟通岗位需求。`,
    riskNotes: DEFAULT_ARRAYS.riskNotes
  }, targetRole);
}

function findMatchedSkills(resumeText, jdText) {
  const resume = normalizeText(resumeText);
  const jd = normalizeText(jdText);
  return SKILL_KEYWORDS.filter((skill) => {
    const normalizedSkill = normalizeText(skill);
    return resume.includes(normalizedSkill) && jd.includes(normalizedSkill);
  });
}

function findMissingSkills(resumeText, jdText) {
  const resume = normalizeText(resumeText);
  const jd = normalizeText(jdText);
  const missing = SKILL_KEYWORDS.filter((skill) => {
    const normalizedSkill = normalizeText(skill);
    return jd.includes(normalizedSkill) && !resume.includes(normalizedSkill);
  });

  if (!missing.length) {
    return ['项目量化指标', '在线 demo 链接', '岗位关键词定制'];
  }

  return missing.slice(0, 8);
}

function calculateScore(matchedSkills, missingSkills, resumeText) {
  const hasProject = /项目|demo|github|系统|应用|合约|看板/i.test(resumeText);
  const hasLocation = /上海|线下|到岗|实习/i.test(resumeText);
  const base = 38;
  const matchedBonus = matchedSkills.length * 8;
  const missingPenalty = missingSkills.length * 3;
  const projectBonus = hasProject ? 12 : 0;
  const locationBonus = hasLocation ? 6 : 0;
  return Math.max(35, Math.min(92, base + matchedBonus + projectBonus + locationBonus - missingPenalty));
}

function asStringArray(value) {
  if (Array.isArray(value)) {
    return value.map(asText).filter(Boolean);
  }

  const text = asText(value);
  return text ? [text] : [];
}

function withDefaultArray(value, fallback) {
  const array = asStringArray(value);
  return array.length ? array : fallback;
}

function asText(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function normalizeText(value) {
  return String(value || '').toLowerCase().replace(/\s+/g, ' ');
}

function buildDefaultSummary(score) {
  if (score >= 80) {
    return '匹配度较高，建议尽快补充作品链接并投递。';
  }
  if (score >= 60) {
    return '具备基础匹配度，需要用项目作品补强岗位关键词。';
  }
  return '当前简历与岗位要求仍有距离，建议先补充一个小型可运行项目。';
}

function buildDefaultOutreach(targetRole) {
  return `您好，我想应聘 ${targetRole} 相关实习/兼职岗位。我具备基础开发能力，正在持续完善 AI/Web3 项目作品，希望能进一步沟通岗位要求。`;
}
