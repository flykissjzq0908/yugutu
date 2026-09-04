const path = require('path');
const fs = require('fs');

// 让 Playwright 使用工作区内的临时目录，避免写入系统 Temp 被沙箱拦截
const tmpDir = path.join(__dirname, '.tmp');
fs.mkdirSync(tmpDir, { recursive: true });
process.env.TMP = tmpDir;
process.env.TEMP = tmpDir;

const candidates = [
  'C:\\Users\\jinzq\\.cache\\codex-runtimes\\codex-primary-runtime\\dependencies\\node\\node_modules\\playwright-core',
  'C:\\Users\\jinzq\\.cache\\codex-runtimes\\codex-primary-runtime\\dependencies\\node\\node_modules\\playwright'
];

function resolve() {
  for (const c of candidates) {
    try { return require(c); } catch (e) { /* try next */ }
  }
  try { return require('playwright'); } catch (e) { /* ignore */ }
  throw new Error('playwright not found in bundled runtime');
}

module.exports = resolve();
