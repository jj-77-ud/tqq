import test from 'node:test';
import assert from 'node:assert/strict';

import { parseEnvText } from '../src/env.js';

test('parseEnvText strips BOM and parses key value pairs', () => {
  const env = parseEnvText('\uFEFFDEEPSEEK_API_KEY=secret-value\nPORT=5177\n');

  assert.equal(env.DEEPSEEK_API_KEY, 'secret-value');
  assert.equal(env.PORT, '5177');
});
