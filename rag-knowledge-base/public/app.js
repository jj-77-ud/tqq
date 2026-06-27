const documentList = document.querySelector('#documentList');
const chunkCount = document.querySelector('#chunkCount');
const askForm = document.querySelector('#askForm');
const questionInput = document.querySelector('#questionInput');
const sampleButton = document.querySelector('#sampleButton');
const exportButton = document.querySelector('#exportButton');
const answerText = document.querySelector('#answerText');
const answerState = document.querySelector('#answerState');
const evidenceList = document.querySelector('#evidenceList');

const sampleQuestions = [
  '数据标注兼职需要准备什么能力？',
  '上海找 AI 实习应该准备什么项目？',
  'Web3 兼职有什么风险？',
  'RAG 项目在简历里怎么表达？'
];

let sampleIndex = 0;
let lastExportRecord = null;

loadDocuments();
ask(questionInput.value);

askForm.addEventListener('submit', (event) => {
  event.preventDefault();
  ask(questionInput.value);
});

sampleButton.addEventListener('click', () => {
  sampleIndex = (sampleIndex + 1) % sampleQuestions.length;
  questionInput.value = sampleQuestions[sampleIndex];
  ask(questionInput.value);
});

exportButton.addEventListener('click', () => {
  if (!lastExportRecord) {
    return;
  }

  const blob = new Blob([JSON.stringify(lastExportRecord, null, 2)], {
    type: 'application/json'
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'rag-qa-record.json';
  link.click();
  URL.revokeObjectURL(url);
});

async function loadDocuments() {
  const response = await fetch('/api/documents');
  const payload = await response.json();
  chunkCount.textContent = String(payload.chunkCount);
  documentList.innerHTML = payload.documents.map(renderDocument).join('');
}

async function ask(question) {
  const trimmed = question.trim();
  if (!trimmed) {
    return;
  }

  answerState.textContent = 'retrieving';
  answerText.textContent = '检索中...';
  evidenceList.innerHTML = '';

  const response = await fetch('/api/ask', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ question: trimmed })
  });
  const payload = await response.json();

  if (!response.ok) {
    answerState.textContent = 'error';
    answerText.textContent = payload.error || '请求失败';
    return;
  }

  lastExportRecord = payload.exportRecord;
  answerState.textContent = 'answered';
  answerText.textContent = payload.answer;
  evidenceList.innerHTML = payload.evidence.map(renderEvidence).join('');
}

function renderDocument(document) {
  return [
    '<article class="document-card">',
    '<div class="document-meta">',
    '<span>' + escapeHtml(document.category) + '</span>',
    '<span>' + escapeHtml(document.updatedAt) + '</span>',
    '</div>',
    '<h3>' + escapeHtml(document.title) + '</h3>',
    '<p>' + escapeHtml(document.preview) + '...</p>',
    '</article>'
  ].join('');
}

function renderEvidence(item) {
  const terms = item.matchedTerms.slice(0, 6).map((term) => {
    return '<span>' + escapeHtml(term) + '</span>';
  }).join('');

  return [
    '<article class="evidence-card">',
    '<div class="evidence-top">',
    '<h3>' + escapeHtml(item.sourceTitle) + '</h3>',
    '<strong>' + item.score.toFixed(2) + '</strong>',
    '</div>',
    '<p>' + escapeHtml(item.text) + '</p>',
    '<div class="term-row">' + terms + '</div>',
    '</article>'
  ].join('');
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}
