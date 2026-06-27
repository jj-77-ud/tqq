const typeLabels = {
  classification: '文本分类',
  response_evaluation: '回答评分',
  preference: 'A/B 偏好'
};

const storageKey = 'ai-labelops-annotations-v1';
let tasks = [];
let guidelines = [];
let activeType = 'classification';
let activeTaskId = '';
let annotations = loadAnnotations();

const typeTabs = document.querySelector('#typeTabs');
const taskList = document.querySelector('#taskList');
const taskEditor = document.querySelector('#taskEditor');
const guidelineList = document.querySelector('#guidelineList');
const metricGrid = document.querySelector('#metricGrid');
const issueList = document.querySelector('#issueList');
const exportPreview = document.querySelector('#exportPreview');
const resetButton = document.querySelector('#resetButton');
const exportButton = document.querySelector('#exportButton');

resetButton.addEventListener('click', () => {
  annotations = {};
  saveAnnotations();
  render();
});

exportButton.addEventListener('click', exportDataset);

init();

async function init() {
  const response = await fetch('/api/tasks');
  const payload = await response.json();
  tasks = payload.tasks;
  guidelines = payload.guidelines;
  activeTaskId = tasks.find((task) => task.type === activeType).id;
  render();
}

function render() {
  renderTabs();
  renderTaskList();
  renderEditor();
  renderGuidelines();
  refreshMetrics();
}

function renderTabs() {
  typeTabs.textContent = '';
  for (const type of Object.keys(typeLabels)) {
    const button = document.createElement('button');
    button.className = type === activeType ? 'tab is-active' : 'tab';
    button.type = 'button';
    button.textContent = typeLabels[type] + ' · ' + tasks.filter((task) => task.type === type).length;
    button.addEventListener('click', () => {
      activeType = type;
      activeTaskId = tasks.find((task) => task.type === activeType).id;
      render();
    });
    typeTabs.append(button);
  }
}

function renderTaskList() {
  taskList.textContent = '';
  for (const task of tasks.filter((item) => item.type === activeType)) {
    const annotation = annotations[task.id];
    const button = document.createElement('button');
    button.type = 'button';
    button.className = task.id === activeTaskId ? 'task-button is-active' : 'task-button';
    button.innerHTML = '<strong>' + task.title + '</strong><span>' + task.id + '</span><em>' + (annotation ? '已标注' : '待处理') + '</em>';
    button.addEventListener('click', () => {
      activeTaskId = task.id;
      render();
    });
    taskList.append(button);
  }
}

function renderEditor() {
  const task = tasks.find((item) => item.id === activeTaskId);
  const annotation = annotations[task.id] || {};
  taskEditor.textContent = '';

  const title = document.createElement('h2');
  title.textContent = task.title;
  taskEditor.append(title);

  const meta = document.createElement('p');
  meta.className = 'task-meta';
  meta.textContent = typeLabels[task.type] + ' / ' + task.id;
  taskEditor.append(meta);

  if (task.type === 'classification') {
    taskEditor.append(makeContentBlock('待标注文本', task.content));
    const select = makeSelect('label', task.labels, annotation.label || '');
    taskEditor.append(makeField('标签', select));
  }

  if (task.type === 'response_evaluation') {
    taskEditor.append(makeContentBlock('用户问题', task.prompt));
    taskEditor.append(makeContentBlock('AI 回答', task.response));
    for (const key of ['accuracy', 'completeness', 'safety', 'expression']) {
      const input = document.createElement('input');
      input.type = 'range';
      input.min = '1';
      input.max = '5';
      input.value = annotation.scores?.[key] || 3;
      input.name = key;
      taskEditor.append(makeField(scoreLabel(key) + '：' + input.value, input));
      input.addEventListener('input', () => {
        input.parentElement.querySelector('label').textContent = scoreLabel(key) + '：' + input.value;
      });
    }
  }

  if (task.type === 'preference') {
    taskEditor.append(makeContentBlock('Prompt', task.prompt));
    taskEditor.append(makeContentBlock('回答 A', task.answerA));
    taskEditor.append(makeContentBlock('回答 B', task.answerB));
    const choice = makeSelect('chosen', ['A', 'B', 'tie'], annotation.chosen || '');
    taskEditor.append(makeField('偏好选择', choice));
  }

  const reason = document.createElement('textarea');
  reason.name = 'reason';
  reason.placeholder = '写一句理由：为什么这样标注？依据是什么？';
  reason.value = annotation.reason || '';
  taskEditor.append(makeField('标注理由', reason));

  const button = document.createElement('button');
  button.className = 'primary-button full';
  button.type = 'button';
  button.textContent = '保存标注';
  button.addEventListener('click', () => saveCurrentAnnotation(task));
  taskEditor.append(button);
}

function saveCurrentAnnotation(task) {
  const formValues = Object.fromEntries([...taskEditor.querySelectorAll('[name]')].map((element) => [element.name, element.value]));
  const base = {
    id: task.id,
    type: task.type,
    annotator: 'demo-annotator',
    reason: formValues.reason || ''
  };

  if (task.type === 'classification') {
    base.label = formValues.label || '';
  }

  if (task.type === 'response_evaluation') {
    base.scores = {
      accuracy: Number(formValues.accuracy || 3),
      completeness: Number(formValues.completeness || 3),
      safety: Number(formValues.safety || 3),
      expression: Number(formValues.expression || 3)
    };
  }

  if (task.type === 'preference') {
    base.chosen = formValues.chosen || '';
    base.rejected = formValues.chosen === 'A' ? 'B' : formValues.chosen === 'B' ? 'A' : '';
  }

  annotations[task.id] = base;
  saveAnnotations();
  render();
}

function renderGuidelines() {
  guidelineList.textContent = '';
  for (const guideline of guidelines) {
    const block = document.createElement('section');
    block.className = 'guideline-block';
    const title = document.createElement('h3');
    title.textContent = guideline.title;
    const list = document.createElement('ul');
    for (const point of guideline.points) {
      const item = document.createElement('li');
      item.textContent = point;
      list.append(item);
    }
    block.append(title, list);
    guidelineList.append(block);
  }
}

async function refreshMetrics() {
  const response = await fetch('/api/metrics', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ annotations: Object.values(annotations) })
  });
  const payload = await response.json();
  renderMetrics(payload.metrics);
  renderIssues(payload.issues);
  exportPreview.textContent = JSON.stringify(payload.preview, null, 2);
}

function renderMetrics(metrics) {
  metricGrid.textContent = '';
  const items = [
    ['总样本', metrics.total],
    ['已完成', metrics.completed],
    ['缺理由', metrics.missingReason],
    ['低分样本', metrics.lowScore],
    ['平均分', metrics.averageScore],
    ['A/B/Tie', metrics.preference.A + '/' + metrics.preference.B + '/' + metrics.preference.tie]
  ];
  for (const [label, value] of items) {
    const block = document.createElement('div');
    block.className = 'metric';
    block.innerHTML = '<span>' + label + '</span><strong>' + value + '</strong>';
    metricGrid.append(block);
  }
}

function renderIssues(issues) {
  issueList.textContent = '';
  if (!issues.length) {
    issueList.textContent = '暂无质检问题';
    return;
  }
  for (const issue of issues) {
    const item = document.createElement('div');
    item.className = 'issue';
    item.textContent = issue.id + ' · ' + issue.message;
    issueList.append(item);
  }
}

async function exportDataset() {
  const response = await fetch('/api/export', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ annotations: Object.values(annotations) })
  });
  const payload = await response.json();
  const blob = new Blob([JSON.stringify(payload.dataset, null, 2)], { type: 'application/json' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = 'ai-labelops-dataset.json';
  link.click();
  URL.revokeObjectURL(link.href);
}

function makeContentBlock(title, text) {
  const block = document.createElement('div');
  block.className = 'content-block';
  block.innerHTML = '<span>' + title + '</span><p></p>';
  block.querySelector('p').textContent = text;
  return block;
}

function makeField(labelText, control) {
  const field = document.createElement('div');
  field.className = 'field';
  const label = document.createElement('label');
  label.textContent = labelText;
  field.append(label, control);
  return field;
}

function makeSelect(name, options, value) {
  const select = document.createElement('select');
  select.name = name;
  const empty = document.createElement('option');
  empty.value = '';
  empty.textContent = '请选择';
  select.append(empty);
  for (const option of options) {
    const element = document.createElement('option');
    element.value = option;
    element.textContent = option;
    element.selected = option === value;
    select.append(element);
  }
  return select;
}

function scoreLabel(key) {
  return {
    accuracy: '准确性',
    completeness: '完整性',
    safety: '安全性',
    expression: '表达质量'
  }[key];
}

function loadAnnotations() {
  try {
    return JSON.parse(localStorage.getItem(storageKey)) || {};
  } catch {
    return {};
  }
}

function saveAnnotations() {
  localStorage.setItem(storageKey, JSON.stringify(annotations));
}
