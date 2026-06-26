import {
  buildAnalysisPrompt,
  createFallbackAnalysis,
  extractJsonObject,
  normalizeAnalysis
} from './analyzer.js';

const DEEPSEEK_ENDPOINT = 'https://api.deepseek.com/chat/completions';

export async function analyzeWithDeepSeek({ resumeText, jdText, targetRole, apiKey }) {
  if (!apiKey) {
    return {
      source: 'fallback',
      warning: '未检测到 DEEPSEEK_API_KEY，已使用本地模拟分析。',
      analysis: createFallbackAnalysis({ resumeText, jdText, targetRole })
    };
  }

  const prompt = buildAnalysisPrompt({ resumeText, jdText, targetRole });

  try {
    const response = await fetch(DEEPSEEK_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        temperature: 0.2,
        response_format: { type: 'json_object' },
        messages: [
          {
            role: 'system',
            content: '你只输出严格 JSON，不输出 Markdown，不输出额外解释。'
          },
          {
            role: 'user',
            content: prompt
          }
        ]
      })
    });

    if (!response.ok) {
      const detail = await response.text();
      throw new Error(`DeepSeek API ${response.status}: ${detail.slice(0, 160)}`);
    }

    const payload = await response.json();
    const content = payload?.choices?.[0]?.message?.content || '';
    const parsed = extractJsonObject(content);

    return {
      source: 'deepseek',
      warning: '',
      analysis: normalizeAnalysis(parsed, targetRole)
    };
  } catch (error) {
    return {
      source: 'fallback',
      warning: `DeepSeek 调用失败，已使用本地模拟分析：${error.message}`,
      analysis: createFallbackAnalysis({ resumeText, jdText, targetRole })
    };
  }
}
