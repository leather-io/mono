#!/usr/bin/env node
import { execSync } from 'node:child_process';
import { existsSync, readdirSync, statSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const toolsRoot = join(__dirname, '..');
const distDir = join(toolsRoot, 'dist');
const srcDir = join(toolsRoot, 'src');

function getNewestSourceTime(dir) {
  let newest = 0;
  const entries = readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      const dirTime = getNewestSourceTime(fullPath);
      if (dirTime > newest) newest = dirTime;
    } else if (entry.name.endsWith('.ts')) {
      const stat = statSync(fullPath);
      if (stat.mtimeMs > newest) newest = stat.mtimeMs;
    }
  }
  return newest;
}

function needsRebuild() {
  if (!existsSync(distDir)) return true;

  const distTime = statSync(distDir).mtimeMs;
  const srcTime = getNewestSourceTime(srcDir);

  return srcTime > distTime;
}

if (needsRebuild()) {
  console.log('Rebuilding tools...');
  execSync('pnpm build', { cwd: toolsRoot, stdio: 'inherit' });
}

await import('../dist/lt.js');
