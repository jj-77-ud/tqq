# Onchain Address Dashboard

链上地址分析看板是一个面向 Web3 数据分析岗位的作品集项目。它使用离线样例交易数据完成地址画像、资金流统计、交互对象分析、风险标签识别和 JSON 报告导出。

## Features

- 地址画像：DeFi Power User、Bridge Hopper、High Risk Counterparty 等。
- 交易聚合：交易数、总交易量、流入流出、净流入、活跃天数、合约交互数。
- 风险规则：mixer exposure、phishing counterparty、approval risk、bridge-heavy、dusting、failed transactions。
- 数据视图：风险标签、资产流向、Top Counterparties、Activity Timeline、建议动作和报告预览。
- 零依赖运行：不需要 RPC、API key 或第三方服务。

## Run

```bash
npm.cmd test
npm.cmd start
```

Open:

```text
http://127.0.0.1:5202
```

## API

```text
GET  /api/wallets
GET  /api/report?address=defi-power-user
POST /api/analyze
```

## Project Structure

```text
src/
  addressAnalyzer.js
  riskRules.js
  sampleWallets.js
public/
  index.html
  app.js
  styles.css
test/
  addressAnalyzer.test.js
  server.test.js
server.js
```

## Resume Bullets

- 开发链上地址分析看板，实现钱包交易聚合、资金流统计、风险标签识别、交互对象分析和地址画像分类。
- 设计离线链上样例数据集与可解释风险规则，覆盖 mixer、phishing、approval、bridge-heavy、dusting 等常见地址风险。
- 构建可交互 Web3 数据分析工作台，支持样例地址切换、资产流向展示、Top Counterparties 表格和 JSON 报告导出。
