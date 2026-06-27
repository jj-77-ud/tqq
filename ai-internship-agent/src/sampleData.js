export const candidateProfile = {
  name: 'Student Candidate',
  targetCity: '上海',
  skills: ['JavaScript', 'Node.js', 'RAG', 'LLM Evaluation', 'Data Annotation', 'Web3 Risk', 'Prompt'],
  projects: [
    { name: 'AI Resume Match', keywords: ['JD matching', 'resume optimization', '简历', '岗位匹配'] },
    { name: 'AI LabelOps', keywords: ['data annotation', '数据标注', '质检', 'AI training'] },
    { name: 'RAG Knowledge Base', keywords: ['RAG', '知识库', 'citation', '检索增强'] },
    { name: 'LLM Eval Dashboard', keywords: ['LLM Evaluation', '模型评测', '评分', 'A/B'] }
  ]
};

export const sampleJobs = [
  {
    id: 'job-001',
    title: 'AI 产品实习生',
    company: 'Shanghai AI Lab',
    city: '上海',
    status: 'not_applied',
    channel: 'Boss直聘',
    postedAt: '2026-06-25',
    lastActionAt: '',
    jd: '负责 AI 应用原型、需求整理和 Prompt 优化，需要 JavaScript、RAG、数据分析和 AI 产品 Demo 能力。'
  },
  {
    id: 'job-002',
    title: 'RAG 后端实习生',
    company: 'VectorWorks',
    city: '上海',
    status: 'applied',
    channel: '拉勾',
    postedAt: '2026-06-22',
    lastActionAt: '2026-06-24',
    jd: '参与知识库问答系统开发，要求 Node.js、RAG、API、引用来源展示和基础测试意识。'
  },
  {
    id: 'job-003',
    title: 'AI 训练数据标注兼职',
    company: 'DataCraft',
    city: '远程',
    status: 'follow_up',
    channel: '微信群',
    postedAt: '2026-06-21',
    lastActionAt: '2026-06-25',
    jd: '需要理解数据标注规范、模型评测、回答评分、质检规则和 JSON 数据整理。'
  },
  {
    id: 'job-004',
    title: 'AI + Web3 风控内容实习',
    company: 'ChainGuard',
    city: '上海',
    status: 'not_applied',
    channel: 'GitHub Jobs',
    postedAt: '2026-06-26',
    lastActionAt: '',
    jd: '负责 Web3 风控资料整理、链上风险标注、钱包安全内容审核和 AI 辅助质检。'
  },
  {
    id: 'job-005',
    title: 'Web3 增长实习生',
    company: 'Token Rocket',
    city: '远程',
    status: 'applied',
    channel: 'Telegram',
    postedAt: '2026-06-20',
    lastActionAt: '2026-06-23',
    jd: '需要推广代币、承诺收益、引导交易和社区拉新，按转化结果结算。'
  },
  {
    id: 'job-006',
    title: '大模型评测实习生',
    company: 'ModelScope Studio',
    city: '上海',
    status: 'interviewing',
    channel: '内推',
    postedAt: '2026-06-19',
    lastActionAt: '2026-06-26',
    jd: '负责模型评测、Prompt 测试、回答质量评分、错误类型分析和评测报告整理。'
  }
];
