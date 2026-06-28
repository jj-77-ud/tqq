const state = {
  wallets: [],
  activeReport: null,
};

const elements = {
  walletSelect: document.querySelector("#walletSelect"),
  addressInput: document.querySelector("#addressInput"),
  loadButton: document.querySelector("#loadButton"),
  copyReportButton: document.querySelector("#copyReportButton"),
  persona: document.querySelector("#persona"),
  severity: document.querySelector("#severity"),
  riskScore: document.querySelector("#riskScore"),
  txCount: document.querySelector("#txCount"),
  totalVolume: document.querySelector("#totalVolume"),
  netFlow: document.querySelector("#netFlow"),
  contractInteractions: document.querySelector("#contractInteractions"),
  activeDays: document.querySelector("#activeDays"),
  riskList: document.querySelector("#riskList"),
  assetFlows: document.querySelector("#assetFlows"),
  counterpartyRows: document.querySelector("#counterpartyRows"),
  timeline: document.querySelector("#timeline"),
  recommendations: document.querySelector("#recommendations"),
  reportPreview: document.querySelector("#reportPreview"),
};

function money(value) {
  return Number(value || 0).toLocaleString("zh-CN", {
    maximumFractionDigits: 0,
  });
}

function shortAddress(address) {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

function severityClass(value) {
  return String(value || "Info").toLowerCase();
}

function renderProfile(report) {
  elements.persona.textContent = report.target.persona;
  elements.severity.textContent = report.summary.severity;
  elements.riskScore.textContent = report.summary.riskScore;
  elements.txCount.textContent = report.summary.transactionCount;
  elements.totalVolume.textContent = money(report.summary.totalVolumeUsd);
  elements.netFlow.textContent = money(report.summary.netFlowUsd);
  elements.contractInteractions.textContent = report.summary.contractInteractions;
  elements.activeDays.textContent = report.summary.activeDays;
  elements.addressInput.value = report.target.address;
  document.body.dataset.severity = severityClass(report.summary.severity);
}

function renderRisks(report) {
  if (!report.risks.length) {
    elements.riskList.innerHTML = `
      <div class="empty-state">
        <strong>未发现明显风险标签</strong>
        <p>仍建议检查授权、跨链路径和交易上下文。</p>
      </div>
    `;
    return;
  }

  elements.riskList.innerHTML = report.risks
    .map((risk) => `
      <section class="risk ${severityClass(risk.severity)}">
        <div>
          <strong>${risk.label}</strong>
          <span>${risk.severity}</span>
        </div>
        <p>${risk.description}</p>
        <small>Evidence: ${risk.evidence.join(", ")}</small>
      </section>
    `)
    .join("");
}

function renderAssets(report) {
  const max = Math.max(...report.flows.map((flow) => flow.volumeUsd), 1);
  elements.assetFlows.innerHTML = report.flows
    .map((flow) => `
      <div class="asset-row">
        <div>
          <strong>${flow.asset}</strong>
          <span>Net ${money(flow.netUsd)}</span>
        </div>
        <div class="bar">
          <span style="width: ${Math.max(6, (flow.volumeUsd / max) * 100)}%"></span>
        </div>
        <small>${money(flow.volumeUsd)} USD</small>
      </div>
    `)
    .join("");
}

function renderCounterparties(report) {
  elements.counterpartyRows.innerHTML = report.counterparties
    .map((item) => `
      <tr>
        <td><code>${shortAddress(item.counterparty)}</code></td>
        <td>${item.type}</td>
        <td>${item.txCount}</td>
        <td>${money(item.volumeUsd)}</td>
      </tr>
    `)
    .join("");
}

function renderTimeline(report) {
  elements.timeline.innerHTML = report.timeline
    .slice(0, 8)
    .map((tx) => `
      <div class="timeline-row ${tx.direction}">
        <span>${tx.date}</span>
        <strong>${tx.direction.toUpperCase()} ${tx.asset} · ${money(tx.amountUsd)}</strong>
        <p>${tx.method} with ${tx.counterpartyType} · ${shortAddress(tx.counterparty)}</p>
      </div>
    `)
    .join("");
}

function renderRecommendations(report) {
  elements.recommendations.innerHTML = report.recommendations
    .map((item) => `<li>${item}</li>`)
    .join("");
}

function renderReport(payload) {
  const report = payload.report;
  state.activeReport = report;
  renderProfile(report);
  renderRisks(report);
  renderAssets(report);
  renderCounterparties(report);
  renderTimeline(report);
  renderRecommendations(report);
  elements.reportPreview.textContent = JSON.stringify(report, null, 2);
}

async function loadWallets() {
  const response = await fetch("/api/wallets");
  const data = await response.json();
  state.wallets = data.wallets;
  elements.walletSelect.innerHTML = data.wallets
    .map((wallet) => `<option value="${wallet.id}">${wallet.label}</option>`)
    .join("");
}

async function loadReport(id = "defi-power-user") {
  const response = await fetch(`/api/report?address=${encodeURIComponent(id)}`);
  const payload = await response.json();
  renderReport(payload);
}

elements.walletSelect.addEventListener("change", () => {
  loadReport(elements.walletSelect.value);
});

elements.loadButton.addEventListener("click", () => {
  loadReport(elements.walletSelect.value);
});

elements.copyReportButton.addEventListener("click", async () => {
  await navigator.clipboard.writeText(JSON.stringify(state.activeReport, null, 2));
  const old = elements.copyReportButton.textContent;
  elements.copyReportButton.textContent = "已复制";
  setTimeout(() => {
    elements.copyReportButton.textContent = old;
  }, 1200);
});

await loadWallets();
await loadReport();
