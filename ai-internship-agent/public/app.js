const kpiGrid = document.querySelector('#kpiGrid');
const pipelineGrid = document.querySelector('#pipelineGrid');
const actionList = document.querySelector('#actionList');
const jobList = document.querySelector('#jobList');
const jobCount = document.querySelector('#jobCount');
const exportButton = document.querySelector('#exportButton');

const statusLabels = {
  not_applied: '未投递',
  applied: '已投递',
  follow_up: '待跟进',
  interviewing: '面试中',
  rejected: '已拒绝'
};

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
  link.download = 'ai-internship-applications.json';
  link.click();
  URL.revokeObjectURL(url);
});

async function loadDashboard() {
  const [jobsResponse, summaryResponse, exportResponse] = await Promise.all([
    fetch('/api/jobs'),
    fetch('/api/summary'),
    fetch('/api/export')
  ]);

  const jobsPayload = await jobsResponse.json();
  const summary = await summaryResponse.json();
  exportPayload = await exportResponse.json();

  renderKpis(summary);
  renderPipeline(summary.byStatus);
  renderActions(summary.followUps);
  renderJobs(jobsPayload.jobs);
}

function renderKpis(summary) {
  const cards = [
    ['岗位总数', summary.totalJobs, 'total'],
    ['平均匹配', summary.averageScore.toFixed(1), 'score'],
    ['高优先级', summary.highPriorityCount, 'high'],
    ['风险岗位', summary.riskJobCount, 'risk']
  ];

  kpiGrid.innerHTML = cards.map((card) => {
    return '<article class="kpi-card ' + card[2] + '"><span>' + card[0] + '</span><strong>' + card[1] + '</strong></article>';
  }).join('');
}

function renderPipeline(byStatus) {
  pipelineGrid.innerHTML = Object.entries(statusLabels).map(([status, label]) => {
    const value = byStatus[status] || 0;
    return '<article class="status-card"><span>' + label + '</span><strong>' + value + '</strong></article>';
  }).join('');
}

function renderActions(actions) {
  actionList.innerHTML = actions.map((action) => {
    return [
      '<article class="action-card ' + escapeHtml(action.urgency) + '">',
      '<div><strong>' + escapeHtml(action.company) + '</strong><span>' + escapeHtml(action.actionType) + '</span></div>',
      '<h3>' + escapeHtml(action.title) + '</h3>',
      '<p>' + escapeHtml(action.message) + '</p>',
      '</article>'
    ].join('');
  }).join('');
}

function renderJobs(jobs) {
  jobCount.textContent = jobs.length + ' jobs';
  const sorted = [...jobs].sort((a, b) => b.fit.score - a.fit.score);

  jobList.innerHTML = sorted.map((job) => {
    return [
      '<article class="job-card">',
      '<div class="job-top">',
      '<div>',
      '<h3>' + escapeHtml(job.title) + '</h3>',
      '<p>' + escapeHtml(job.company) + ' · ' + escapeHtml(job.city) + ' · ' + escapeHtml(job.channel) + '</p>',
      '</div>',
      '<strong class="job-score ' + escapeHtml(job.fit.priority) + '">' + job.fit.score + '</strong>',
      '</div>',
      '<div class="chip-row">',
      '<span>' + escapeHtml(statusLabels[job.status] || job.status) + '</span>',
      '<span>' + escapeHtml(job.fit.priority) + '</span>',
      job.fit.riskFlags.map((flag) => '<span class="risk-chip">' + escapeHtml(flag) + '</span>').join(''),
      '</div>',
      '<p class="jd">' + escapeHtml(job.jd) + '</p>',
      '<div class="match-row">',
      renderList('命中能力', job.fit.matchedSkills),
      renderList('补强能力', job.fit.missingSkills),
      renderList('推荐项目', job.fit.recommendedProjects.map((project) => project.name)),
      '</div>',
      '<div class="outreach"><b>投递话术</b><p>' + escapeHtml(job.outreach) + '</p></div>',
      '</article>'
    ].join('');
  }).join('');
}

function renderList(title, items) {
  const value = items.length > 0 ? items.join('、') : '无';
  return '<div><span>' + title + '</span><strong>' + escapeHtml(value) + '</strong></div>';
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}
