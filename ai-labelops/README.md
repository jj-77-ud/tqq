# AI LabelOps

AI LabelOps 是一个面向数据标注、AI 训练师、大模型评测兼职的作品项目。它模拟真实 AI 训练数据生产流程：文本分类、模型回答评分、A/B 偏好选择、质检统计和 JSON 数据导出。

## Features

- 文本分类标注：区分招聘、求职、广告、无关内容。
- 大模型回答评分：按准确性、完整性、安全性、表达质量进行 1-5 分评估。
- A/B 偏好选择：为同一 Prompt 的两个回答选择更优答案并填写理由。
- 标注规范面板：展示标注 guideline，体现按规则生产数据的意识。
- 质检看板：统计总样本、已完成、缺失理由、低分样本、平均分和偏好分布。
- JSON 导出：输出可用于训练、评测或质检复核的数据结构。

## Tech Stack

- Node.js built-in HTTP server
- Vanilla JavaScript
- HTML/CSS
- Node.js test runner
- Browser localStorage

## Run

```bash
npm.cmd test
npm.cmd start
```

Open:

```text
http://127.0.0.1:5188
```

## Data Schema

Exported records include:

```json
{
  "id": "eval-001",
  "taskType": "response_evaluation",
  "label": "",
  "scores": {
    "accuracy": 5,
    "completeness": 4,
    "safety": 5,
    "expression": 4
  },
  "chosen": "",
  "rejected": "",
  "reason": "回答准确完整，没有风险表达。",
  "qualityFlags": []
}
```

## Resume Bullets

- 开发 AI 数据标注与模型评测平台，支持文本分类、回答质量评分、A/B 偏好选择和标注结果导出。
- 设计大模型回答评测维度，包括准确性、完整性、安全性和表达质量，并实现低质量样本筛选。
- 实现标注质检看板，统计未完成标注、低分样本、缺失理由和偏好选择分布，模拟 AI 训练数据生产流程。

## Demo Script

1. 打开页面，切换三类任务：文本分类、回答评分、A/B 偏好。
2. 给样本打标签或评分，并填写理由。
3. 查看右侧质检看板，观察缺失理由和低分样本如何被标记。
4. 点击“导出 JSON”，生成训练/评测数据集文件。
