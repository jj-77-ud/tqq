const state = {
  samples: [],
  activeReport: null,
  activePrompt: "",
};

const elements = {
  sampleSelect: document.querySelector("#sampleSelect"),
  titleInput: document.querySelector("#titleInput"),
  analyzeButton: document.querySelector("#analyzeButton"),
  copyPromptButton: document.querySelector("#copyPromptButton"),
  copyReportButton: document.querySelector("#copyReportButton"),
  sourceInput: document.querySelector("#sourceInput"),
  riskScore: document.querySelector("#riskScore"),
  severity: document.querySelector("#severity"),
  findingCount: document.querySelector("#findingCount"),
  functionCount: document.querySelector("#functionCount"),
  lineCount: document.querySelector("#lineCount"),
  findingsList: document.querySelector("#findingsList"),
  reviewPlan: document.querySelector("#reviewPlan"),
  reportPreview: document.querySelector("#reportPreview"),
};

function severityClass(severity) {
  return String(severity || "Info").toLowerCase();
}

function renderMetrics(report) {
  elements.riskScore.textContent = report.summary.riskScore;
  elements.severity.textContent = report.summary.overallSeverity;
  elements.findingCount.textContent = report.summary.findingCount;
  elements.functionCount.textContent = report.target.functionCount || 0;
  elements.lineCount.textContent = `${report.target.lineCount} lines`;
  document.body.dataset.severity = severityClass(report.summary.overallSeverity);
}

function renderFindings(report) {
  if (!report.findings.length) {
    elements.findingsList.innerHTML = `
      <div class="empty-state">
        <strong>未发现高风险模式</strong>
        <p>继续补充人工审计、业务逻辑检查和单元测试。</p>
      </div>
    `;
    return;
  }

  elements.findingsList.innerHTML = report.findings
    .map((finding) => `
      <section class="finding ${severityClass(finding.severity)}">
        <div class="finding-head">
          <span>${finding.severity}</span>
          <strong>${finding.id}</strong>
        </div>
        <h3>${finding.title}</h3>
        <p>${finding.description}</p>
        <div class="evidence">
          ${finding.evidence.map((line) => `<code>${line}</code>`).join("")}
        </div>
        <ul>
          ${finding.recommendations.map((item) => `<li>${item}</li>`).join("")}
        </ul>
      </section>
    `)
    .join("");
}

function renderPlan(report) {
  elements.reviewPlan.innerHTML = report.reviewPlan
    .map((item) => `<li>${item}</li>`)
    .join("");
}

function renderReport(payload) {
  state.activeReport = payload.report;
  state.activePrompt = payload.llmPrompt;
  renderMetrics(payload.report);
  renderFindings(payload.report);
  renderPlan(payload.report);
  elements.reportPreview.textContent = JSON.stringify(payload.report, null, 2);
}

async function loadSamples() {
  const response = await fetch("/api/samples");
  const data = await response.json();
  state.samples = data.samples;
  elements.sampleSelect.innerHTML = data.samples
    .map((sample) => `<option value="${sample.name}">${sample.label}</option>`)
    .join("");
}

async function loadSampleReport(sampleName = "VulnerableVault") {
  const response = await fetch(`/api/report?sample=${encodeURIComponent(sampleName)}`);
  const payload = await response.json();
  elements.titleInput.value = payload.sample.name;
  elements.sourceInput.value = payload.sample.source;
  renderReport(payload);
}

async function auditCustomSource() {
  elements.analyzeButton.disabled = true;
  elements.analyzeButton.textContent = "审计中";

  const response = await fetch("/api/audit", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      title: elements.titleInput.value || "Custom Contract",
      source: elements.sourceInput.value,
    }),
  });
  const payload = await response.json();
  renderReport(payload);

  elements.analyzeButton.disabled = false;
  elements.analyzeButton.textContent = "开始审计";
}

async function copyText(text, button, doneLabel) {
  await navigator.clipboard.writeText(text);
  const previous = button.textContent;
  button.textContent = doneLabel;
  setTimeout(() => {
    button.textContent = previous;
  }, 1200);
}

elements.sampleSelect.addEventListener("change", () => {
  loadSampleReport(elements.sampleSelect.value);
});

elements.analyzeButton.addEventListener("click", auditCustomSource);

elements.copyPromptButton.addEventListener("click", () => {
  copyText(state.activePrompt, elements.copyPromptButton, "已复制");
});

elements.copyReportButton.addEventListener("click", () => {
  copyText(JSON.stringify(state.activeReport, null, 2), elements.copyReportButton, "已复制");
});

await loadSamples();
await loadSampleReport();
