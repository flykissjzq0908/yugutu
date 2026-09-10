import { rebuildLegacyLayout as rebuildPureLayout } from './rebuildLegacyLayout.js';
import { rebuildLegacyLayoutRenderer } from './rendererLegacyLayout.js';

const engines = {
  pure: {
    name: 'pure',
    run: rebuildPureLayout
  },
  renderer: {
    name: 'renderer',
    run: rebuildLegacyLayoutRenderer
  }
};

let activeEngineName = 'renderer';

export function setLegacyLayoutEngine(name) {
  if (!engines[name]) return false;
  activeEngineName = name;
  return true;
}

export function getLegacyLayoutEngine() {
  return activeEngineName;
}

export async function rebuildLegacyLayout(canvas, ygtstyleValue) {
  const engine = engines[activeEngineName] || engines.renderer;
  let result;
  try {
    result = await engine.run(canvas, ygtstyleValue);
  } catch (e) {
    result = { ok: false, message: e && e.message ? e.message : String(e) };
  }
  if (!result || !result.ok) {
    if (engine.name === 'renderer') {
      const fallback = await rebuildPureLayout(canvas, ygtstyleValue);
      if (fallback && fallback.ok) fallback.message = (result && result.message ? result.message + '，已回退纯算法；' : '已回退纯算法；') + (fallback.message || '');
      return fallback;
    }
    return result;
  }
  return result;
}

export const legacyLayoutEngines = engines;
