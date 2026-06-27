const kpiGrid = document.querySelector('#kpiGrid');
const leaderboard = document.querySelector('#leaderboard');
const errorBars = document.querySelector('#errorBars');
const pairList = document.querySelector('#pairList');
const recordList = document.querySelector('#recordList');
const recordCount = document.querySelector('#recordCount');
const exportButton = document.querySelector('#exportButton');

let exportPayload = null;

loadDashboard();

exportButton.addEventListener('click', () => {
  if (!exportPayload) {
    return;
  }
  const blob = new Blob([JSON.stringify(exportPayload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'llm-eval-dataset.json';
  link.click();
  URL.revokeObjectURL(url);
});

async function loadDashboard() {
  const [summaryResponse, recordsResponse, exportResponse] = await Promise.all([
    fetch('/api/summary'),
    fetch('/api/evaluations'),
    fetch('/api/export')
  ]);

  const summary = await summaryResponse.json();
  const recordsPayload = await recordsResponse.json();
  exportPayload = await exportResponse.json();

  renderKpis(summary);
  renderLeaderboard(summary.leaderboard);
  renderErrors(summary.errorCounts);
  renderPairs(summary.pairComparison);
  renderRecords(recordsPayload.records);
}

function renderKpis(summary) {
  const passRate = summary.totalRecords === 0 ? 0 : Math.round((summary.passed / summary.totalRecords) * 100);
  const safetyIssues = summary.issues.filter((issue) => issue.type === 'safety_risk').length;
  const cards = [
    ['评测记录', summary.totalRecords, 'records'],
    ['平均分', summary.averageScore.toFixed(2), 'score'],
    ['通过率', passRate + '%', 'pass'],
    ['安全风险', safetyIssues, 'critical']
  ];

  kpiGrid.innerHTML = cards.map((card) => {
    return '<article class="kpi-card ' + card[2] + '"><span>' + card[0] + '</span><strong>' + card[1] + '</strong></article>';
  }).join('');
}

function renderLeaderboard(items) {
  leaderboard.innerHTML = items.map((item, index) => {
    return [
      '<article class="leader-row">',
      '<div class="rank">' + (index + 1) + '</div>',
      '<div class="leader-main">',
      '<h3>' + escapeHtml(item.model) + '</h3>',
      '<p>avg ' + item.averageScore.toFixed(2) + ' · pass ' + Math.round(item.passRate * 100) + '% · risk ' + item.safetyRiskCount + '</p>',
      '</div>',
      '<meter min="1" max="5" value="' + item.averageScore + '"></meter>',
      '</article>'
    ].join('');
  }).join('');
}

function renderErrors(errorCounts) {
  const max = Math.max(1, ...Object.values(errorCounts));
  errorBars.innerHTML = Object.entries(errorCounts).map(([type, count]) => {
    const width = Math.max(4, Math.round((count / max) * 100));
    return [
      '<article class="error-row">',
      '<div><strong>' + escapeHtml(type) + '</strong><span>' + count + '</span></div>',
      '<div class="bar-track"><span style="width:' + width + '%"></span></div>',
      '</article>'
    ].join('');
  }).join('');
}

function renderPairs(items) {
  pairList.innerHTML = items.map((item) => {
    return [
      '<article class="pair-card">',
      '<div class="pair-top">',
      '<strong>' + escapeHtml(item.promptId) + '</strong>',
      '<span>' + escapeHtml(item.winner) + ' wins by ' + item.scoreGap.toFixed(2) + '</span>',
      '</div>',
      '<p>' + escapeHtml(item.prompt) + '</p>',
      '<div class="model-chips">',
      item.models.map((model) => '<span>' + escapeHtml(model.model) + ' · ' + model.finalScore.toFixed(2) + '</span>').join(''),
      '</div>',
      '</article>'
    ].join('');
  }).join('');
}

function renderRecords(records) {
  recordCount.textContent = records.length + ' records';
  recordList.innerHTML = records.map((record) => {
    return [
      '<article class="record-card">',
      '<div class="record-top">',
      '<div><strong>' + escapeHtml(record.model) + '</strong><span>' + escapeHtml(record.taskType) + '</span></div>',
      '<b>' + record.finalScore.toFixed(2) + '</b>',
      '</div>',
      '<h3>' + escapeHtml(record.prompt) + '</h3>',
      '<p>' + escapeHtml(record.answer) + '</p>',
      '<div class="score-grid">',
      Object.entries(record.scores).map(([key, value]) => '<span>' + escapeHtml(key) + ': ' + value + '</span>').join(''),
      '</div>',
      '<div class="note">' + escapeHtml(record.reviewerNote || '缺少评审理由') + '</div>',
      '</article>'
    ].join('');
  }).join('');
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}
