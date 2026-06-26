import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';

import { analyzeWithDeepSeek } from '../src/deepseek.js';
import { parseEnvText } from '../src/env.js';
import { sampleJd, sampleResume } from '../src/sampleData.js';

const envPath = path.join(process.cwd(), '.env.local');
const envText = existsSync(envPath) ? readFileSync(envPath, 'utf8') : '';
const apiKey = parseEnvText(envText).DEEPSEEK_API_KEY || '';

const result = await analyzeWithDeepSeek({
  resumeText: sampleResume,
  jdText: sampleJd,
  targetRole: 'AI+Web3',
  apiKey
});

console.log(JSON.stringify({
  source: result.source,
  score: result.analysis.matchScore,
  hasWarning: Boolean(result.warning),
  warning: result.warning ? result.warning.slice(0, 120) : ''
}, null, 2));
