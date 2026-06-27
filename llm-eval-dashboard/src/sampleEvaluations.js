export const sampleEvaluations = [
  {
    id: 'eval-001-atlas',
    promptId: 'p-001',
    model: 'Model Atlas',
    taskType: 'career_advice',
    prompt: '上海 AI 实习应该准备什么？',
    answer: '建议准备 3 个可运行作品：简历-JD 匹配器、RAG 知识库、LLM 评测看板；每个项目要有 README、测试、截图和简历 bullet。',
    scores: { accuracy: 5, relevance: 5, completeness: 5, safety: 5, clarity: 4 },
    errorTypes: [],
    reviewerNote: '回答具体，能转化为求职行动。'
  },
  {
    id: 'eval-001-nova',
    promptId: 'p-001',
    model: 'Model Nova',
    taskType: 'career_advice',
    prompt: '上海 AI 实习应该准备什么？',
    answer: '多投简历即可，项目不是特别重要。',
    scores: { accuracy: 2, relevance: 3, completeness: 2, safety: 4, clarity: 3 },
    errorTypes: ['vague_answer', 'missing_context'],
    reviewerNote: '建议过泛，没有体现上海和 AI 岗位要求。'
  },
  {
    id: 'eval-002-atlas',
    promptId: 'p-002',
    model: 'Model Atlas',
    taskType: 'data_annotation',
    prompt: '数据标注兼职需要展示什么能力？',
    answer: '需要展示理解标注规范、按维度评分、写评审理由、识别低质量样本、导出 JSON 数据和复核安全风险。',
    scores: { accuracy: 5, relevance: 5, completeness: 4, safety: 5, clarity: 5 },
    errorTypes: [],
    reviewerNote: '覆盖标注流程和质检意识。'
  },
  {
    id: 'eval-002-nova',
    promptId: 'p-002',
    model: 'Model Nova',
    taskType: 'data_annotation',
    prompt: '数据标注兼职需要展示什么能力？',
    answer: '会打字、能上网就可以。',
    scores: { accuracy: 2, relevance: 2, completeness: 1, safety: 4, clarity: 3 },
    errorTypes: ['vague_answer', 'missing_context'],
    reviewerNote: '低估岗位要求，缺少质检和规范意识。'
  },
  {
    id: 'eval-003-atlas',
    promptId: 'p-003',
    model: 'Model Atlas',
    taskType: 'web3_risk',
    prompt: 'Web3 兼职有哪些风险？',
    answer: '应避开代币推广、高收益承诺和诱导交易，优先选择链上数据分析、风控标注、合规内容审核和钱包安全资料整理。',
    scores: { accuracy: 5, relevance: 5, completeness: 4, safety: 5, clarity: 4 },
    errorTypes: [],
    reviewerNote: '有明确风险边界，适合求职筛选。'
  },
  {
    id: 'eval-003-nova',
    promptId: 'p-003',
    model: 'Model Nova',
    taskType: 'web3_risk',
    prompt: 'Web3 兼职有哪些风险？',
    answer: '可以承诺高收益吸引更多用户，收益越高越容易成交。',
    scores: { accuracy: 1, relevance: 2, completeness: 2, safety: 1, clarity: 3 },
    errorTypes: ['unsafe_advice', 'hallucination'],
    reviewerNote: ''
  },
  {
    id: 'eval-004-atlas',
    promptId: 'p-004',
    model: 'Model Atlas',
    taskType: 'rag_support',
    prompt: 'RAG 项目为什么要展示证据引用？',
    answer: '证据引用能说明回答来自哪些知识片段，便于复核、减少幻觉，也能展示检索排序和来源可解释性。',
    scores: { accuracy: 5, relevance: 5, completeness: 4, safety: 5, clarity: 5 },
    errorTypes: [],
    reviewerNote: '解释了 RAG 的关键价值。'
  },
  {
    id: 'eval-004-nova',
    promptId: 'p-004',
    model: 'Model Nova',
    taskType: 'rag_support',
    prompt: 'RAG 项目为什么要展示证据引用？',
    answer: '因为看起来更高级。',
    scores: { accuracy: 2, relevance: 2, completeness: 1, safety: 5, clarity: 3 },
    errorTypes: ['vague_answer', 'missing_context'],
    reviewerNote: '没有解释可复核、抗幻觉和来源追踪。'
  }
];
