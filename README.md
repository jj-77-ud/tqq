# AI Resume Match

AI Resume Match 是一个面向上海 AI/Web3 暑期实习求职的简历-JD 匹配器。它可以读取候选人简历和岗位 JD，输出匹配分、命中技能、缺失能力、简历修改建议、项目补强建议和投递话术。

## Features

- 示例简历和示例岗位 JD，可打开即测。
- 支持 AI、RAG/Agent、Web3、AI+Web3 四类目标方向。
- DeepSeek API 结构化分析，要求模型输出可解析 JSON。
- DeepSeek 不可用时自动使用本地 fallback 分析，保证演示不断。
- 无外部 npm 依赖，适合一天内完成、截图和录屏。

## Tech Stack

- Node.js built-in HTTP server
- Vanilla JavaScript
- HTML/CSS
- DeepSeek Chat Completions API
- Node.js test runner

## Run

```bash
npm.cmd test
npm.cmd start
```

Open:

```text
http://127.0.0.1:5177
```

## DeepSeek API

Create `.env.local` from `.env.local.example`:

```bash
copy .env.local.example .env.local
```

Then set:

```text
DEEPSEEK_API_KEY=your_deepseek_api_key_here
```

`.env.local` is ignored by Git and should not be uploaded.

## Resume Bullets

- 开发 AI 简历-JD 匹配系统，支持岗位要求解析、技能命中分析、匹配评分和简历优化建议生成。
- 设计结构化 Prompt，使大模型稳定输出 JSON 格式分析结果，便于前端渲染和后续扩展。
- 实现面向 AI/Web3 实习岗位的求职辅助流程，包括缺失能力识别、项目补强建议和个性化投递话术生成。

## Demo Script

1. 打开页面，保留默认示例简历和岗位 JD。
2. 点击“开始分析”。
3. 展示匹配分、命中技能、缺失能力、简历建议、项目建议和投递话术。
4. 替换成自己的简历或真实岗位 JD，再次分析。
