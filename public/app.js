const form = document.querySelector('#matchForm');
const targetRole = document.querySelector('#targetRole');
const resumeText = document.querySelector('#resumeText');
const jdText = document.querySelector('#jdText');
const analyzeButton = document.querySelector('#analyzeButton');
const sampleButton = document.querySelector('#sampleButton');
const sourceStatus = document.querySelector('#sourceStatus');
const scoreRing = document.querySelector('#scoreRing');
const scoreValue = document.querySelector('#scoreValue');
const summaryTitle = document.querySelector('#summaryTitle');
const summaryText = document.querySelector('#summaryText');
const warningBox = document.querySelector('#warningBox');

const fields = {
  matchedSkills: document.querySelector('#matchedSkills'),
  missingSkills: document.querySelector('#missingSkills'),
  resumeSuggestions: document.querySelector('#resumeSuggestions'),
  projectSuggestions: document.querySelector('#projectSuggestions'),
  outreachMessage: document.querySelector('#outreachMessage'),
  riskNotes: document.querySelector('#riskNotes')
};

loadSample();

sampleButton.addEventListener('click', loadSample);
form.addEventListener('submit', async (event) => {
  event.preventDefault();
  await analyze();
});

async function loadSample() {
  const response = await fetch('/api/sample');
  const sample = await response.json();
  resumeText.value = sample.resumeText;
  jdText.value = sample.jdText;
  targetRole.value = sample.targetRole;
}

async function analyze() {
  setLoading(true);
  clearWarning();

  try {
    const response = await fetch('/api/analyze', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        targetRole: targetRole.value,
        resumeText: resumeText.value,
        jdText: jdText.value
      })
    });

    const payload = await response.json();
    if (!response.ok) {
      throw new Error(payload.error || '分析失败');
    }

    renderResult(payload);
  } catch (error) {
    showWarning(error.message);
  } finally {
    setLoading(false);
  }
}

function renderResult(payload) {
  const analysis = payload.analysis;
  const score = analysis.matchScore;

  sourceStatus.textContent = payload.source === 'deepseek' ? 'DeepSeek' : 'Fallback';
  scoreValue.textContent = String(score);
  scoreRing.style.setProperty('--score', `${score}%`);
  summaryTitle.textContent = `${analysis.targetRole} 匹配度 ${score}`;
  summaryText.textContent = analysis.summary;

  renderChips(fields.matchedSkills, analysis.matchedSkills, '暂无命中');
  renderChips(fields.missingSkills, analysis.missingSkills, '暂无明显缺失');
  renderList(fields.resumeSuggestions, analysis.resumeSuggestions);
  renderList(fields.projectSuggestions, analysis.projectSuggestions);
  renderList(fields.riskNotes, analysis.riskNotes);
  fields.outreachMessage.textContent = analysis.outreachMessage;

  if (payload.warning) {
    showWarning(payload.warning);
  } else {
    clearWarning();
  }
}

function renderChips(container, items, emptyText) {
  container.textContent = '';
  const values = Array.isArray(items) && items.length ? items : [emptyText];
  for (const item of values) {
    const chip = document.createElement('span');
    chip.className = 'chip';
    chip.textContent = item;
    container.append(chip);
  }
}

function renderList(container, items) {
  container.textContent = '';
  for (const item of items || []) {
    const li = document.createElement('li');
    li.textContent = item;
    container.append(li);
  }
}

function setLoading(isLoading) {
  analyzeButton.disabled = isLoading;
  analyzeButton.textContent = isLoading ? '分析中...' : '开始分析';
  sourceStatus.textContent = isLoading ? 'Running' : sourceStatus.textContent;
}

function showWarning(message) {
  warningBox.hidden = false;
  warningBox.textContent = message;
}

function clearWarning() {
  warningBox.hidden = true;
  warningBox.textContent = '';
}
