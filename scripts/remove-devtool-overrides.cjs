const fs = require('fs');
const path = require('path');

const devToolPackages = [
  'esbuild',
  'electron',
  'wrangler',
  'postcss',
  'ajv',
  'webpack',
  'rollup',
  'vite',
  'turbo',
  'typescript',
  'eslint',
  'prettier',
  'storybook',
  '@storybook/',
];

const pkgPath = path.resolve(__dirname, '..', 'package.json');
const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
const overrides = pkg.pnpm?.overrides;

if (!overrides) {
  console.log('No overrides found.');
  process.exit(0);
}

const removed = [];

for (const key of Object.keys(overrides)) {
  const pkgName = key.replace(/@[^@]*$/, '');
  const isDevTool = devToolPackages.some(
    (tool) => pkgName === tool || pkgName.startsWith(tool)
  );

  if (isDevTool) {
    console.log(`REMOVING dev-tool override: "${key}": "${overrides[key]}"`);
    delete overrides[key];
    removed.push(key);
  }
}

if (removed.length === 0) {
  console.log('No dev-tool overrides to remove.');
  process.exit(0);
}

fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n');
console.log(`\nRemoved ${removed.length} dev-tool override(s).`);
