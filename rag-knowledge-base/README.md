# RAG Knowledge Base

RAG Knowledge Base 是一个面向 AI 实习、AI 训练师、数据标注兼职和 Web3 风控内容研究的知识库问答作品。它展示了本地文档切分、关键词检索、Top-K 证据召回、引用来源和问答记录 JSON 导出。

## Features

- 本地知识库：内置 AI 实习 JD、数据标注规范、Web3 风险说明、上海兼职准备清单和作品集检查表。
- RAG 检索：实现分词、中文 n-gram、关键词权重、片段打分和 Top-K 排序。
- 证据引用：回答会展示来源文档、片段 ID、匹配词和相似度分数。
- JSON 导出：生成可用于训练样本沉淀、质检复核或面试展示的问答记录。
- 无外部 npm 依赖：Node.js 内置 HTTP server 和 test runner 即可运行。

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
http://127.0.0.1:5190
```

## API

```text
GET /api/documents
POST /api/ask
```

Example body:

```json
{
  "question": "数据标注兼职需要准备什么能力？"
}
```

## Resume Bullets

- 开发 RAG 知识库问答系统，实现文档切分、关键词检索、Top-K 证据召回、引用来源展示和问答记录 JSON 导出。
- 设计本地检索评分逻辑，结合中英文分词、中文 n-gram、关键词权重和来源元数据，提高岗位资料问答的可解释性。
- 构建面向 AI 实习和数据标注兼职的作品 Demo，覆盖标注规范、模型评测、Web3 风控和上海求职准备等场景。

## Demo Script

1. 打开页面，查看左侧知识库文档和 indexed chunk 数量。
2. 使用默认问题“数据标注兼职需要准备什么能力？”生成回答。
3. 展示右侧证据卡片，包括来源、分数、匹配词和原文片段。
4. 切换示例问题到 Web3 风险或 AI 实习准备。
5. 点击“导出 JSON”，展示可沉淀为训练/评测样本的问答记录。
