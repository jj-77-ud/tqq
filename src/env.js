export function parseEnvText(text) {
  const env = {};
  const normalized = String(text || '').replace(/^\uFEFF/, '');

  for (const line of normalized.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) {
      continue;
    }

    const index = trimmed.indexOf('=');
    if (index === -1) {
      continue;
    }

    const key = trimmed.slice(0, index).trim().replace(/^\uFEFF/, '');
    const value = trimmed.slice(index + 1).trim().replace(/^["']|["']$/g, '');

    if (key) {
      env[key] = value;
    }
  }

  return env;
}
