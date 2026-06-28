# AI Contract Auditor

AI 智能合约审计助手是一个面向 Web3 安全岗位作品集的本地审计工具。它解析 Solidity 源码，识别常见风险模式，输出严重等级、证据行、修复建议、审计报告 JSON 和可复制的 LLM Prompt。

## Features

- Solidity 解析：提取合约、函数、payable 方法、modifier、外部调用和风险关键字。
- 风险识别：覆盖重入、tx.origin 授权、delegatecall、selfdestruct、弱随机、旧编译器版本和敏感函数访问控制。
- 报告生成：输出风险分、总体等级、发现列表、证据行、修复计划和 JSON 报告。
- AI 辅助：生成可复制 Prompt，便于继续交给 DeepSeek/ChatGPT 做二次审计和补丁建议。
- 零依赖运行：只需要 Node.js。

## Run

```bash
npm.cmd test
npm.cmd start
```

Open:

```text
http://127.0.0.1:5200
```

## API

```text
GET  /api/samples
GET  /api/report?sample=VulnerableVault
POST /api/audit
```

## Project Structure

```text
src/
  auditEngine.js
  contractParser.js
  sampleContracts.js
public/
  index.html
  app.js
  styles.css
test/
  auditEngine.test.js
  server.test.js
server.js
```

## Resume Bullets

- 开发 AI 智能合约审计助手，实现 Solidity 源码解析、风险模式识别、严重等级评分、证据行定位和修复建议生成。
- 设计离线规则审计引擎，覆盖重入、tx.origin 授权、弱随机、delegatecall、selfdestruct 等智能合约安全风险。
- 构建审计工作台与 JSON 报告导出能力，并生成可复制 LLM Prompt，用于二次审计和补丁分析。
