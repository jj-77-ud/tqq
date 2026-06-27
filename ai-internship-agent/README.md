# AI Internship Agent

AI Internship Agent 是一个面向 AI 实习投递的效率工具作品。它模拟一个轻量 Agent 工作流：管理岗位列表、分析 JD 匹配度、识别风险岗位、生成投递话术、规划跟进动作，并导出 JSON 投递记录。

## Features

- 岗位管道：not_applied、applied、follow_up、interviewing、rejected。
- JD 匹配：根据候选人技能和项目经历计算匹配分、优先级、命中能力和补强能力。
- 风险识别：识别代币推广、收益承诺、引导交易、无薪试用等高风险描述。
- 投递话术：自动生成针对岗位和项目经历的简短沟通话术。
- 跟进计划：根据投递状态和日期生成 apply、follow_up、prepare_interview 等动作。
- JSON 导出：输出可复盘、可持续维护的投递数据。

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
http://127.0.0.1:5196
```

## API

```text
GET /api/jobs
GET /api/summary
GET /api/export
```

## Resume Bullets

- 开发 AI 实习投递助手，实现岗位管道管理、JD 匹配评分、风险岗位识别、投递话术生成和跟进动作规划。
- 设计轻量 Agent 决策逻辑，将岗位 JD、个人技能、项目经历和投递状态转化为优先级和下一步行动。
- 构建可导出的求职数据结构，支持投递复盘、状态跟踪和面试前项目材料准备。

## Demo Script

1. 打开看板，展示岗位总数、平均匹配、高优先级和风险岗位。
2. 查看投递管道，说明每个状态对应的求职阶段。
3. 展示下一步动作，说明 Agent 如何根据状态和日期生成跟进任务。
4. 打开岗位匹配卡片，展示匹配分、风险标签、推荐项目和投递话术。
5. 点击“导出投递 JSON”，展示可持续维护的投递记录。
