# LLM Eval Dashboard

LLM Eval Dashboard 是一个面向 AI 训练师、数据标注、模型评测兼职和 AI 实习岗位的作品项目。它模拟真实模型评测流程：对多个模型回答进行多维评分、错误类型标注、A/B 对比、质量问题筛查和 JSON 数据导出。

## Features

- 五维评分：accuracy、relevance、completeness、safety、clarity。
- 错误分类：hallucination、missing_context、unsafe_advice、wrong_format、vague_answer。
- 模型榜单：统计平均分、通过率、安全风险数量和维度均分。
- A/B 对比：按 promptId 比较两个模型回答，展示赢家和分差。
- 问题样本筛查：自动标记缺少评审理由、低分样本、安全风险和格式错误。
- JSON 导出：输出可复核、可沉淀的评测数据集。

## Tech Stack

- Node.js built-in HTTP server
- Vanilla JavaScript
- HTML/CSS
- Node.js test runner

## Run

```bash
npm.cmd test
npm.cmd start
```

Open:

```text
http://127.0.0.1:5192
```

## API

```text
GET /api/evaluations
GET /api/summary
GET /api/export
```

## Resume Bullets

- 开发 LLM 评测看板，实现模型回答五维评分、错误类型统计、A/B 对比、质量风险识别和评测数据 JSON 导出。
- 设计面向 AI 训练与数据标注场景的评测指标体系，覆盖准确性、相关性、完整性、安全性和表达清晰度。
- 构建可解释的模型质量分析流程，支持模型榜单、通过率、安全风险计数和问题样本复核。

## Demo Script

1. 打开看板，展示顶部 KPI：评测记录、平均分、通过率、安全风险。
2. 展示模型榜单，说明哪个模型更适合当前任务集。
3. 查看错误类型分布，指出 unsafe_advice、missing_context 等问题。
4. 展示 A/B 对比列表，说明按同一个 prompt 比较模型输出。
5. 点击“导出评测 JSON”，展示可交付给训练/质检流程的数据结构。
