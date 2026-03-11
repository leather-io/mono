const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const pkgPath = path.resolve(__dirname, '..', 'package.json');
const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
const overrides = pkg.pnpm?.overrides;

if (!overrides || Object.keys(overrides).length === 0) {
  console.log('No overrides found.');
  process.exit(0);
}

const removed = [];

for (const [key, value] of Object.entries(overrides)) {
  // Try removing this single override, install, and audit
  const testPkg = JSON.parse(JSON.stringify(pkg));
  delete testPkg.pnpm.overrides[key];
  fs.writeFileSync(pkgPath, JSON.stringify(testPkg, null, 2) + '\n');

  try {
    execSync('pnpm install --lockfile-only 2>&1', {
      cwd: path.resolve(__dirname, '..'),
      stdio: 'pipe',
      timeout: 120_000,
    });

    const auditResult = execSync('pnpm audit --audit-level=moderate 2>&1', {
      cwd: path.resolve(__dirname, '..'),
      stdio: 'pipe',
      timeout: 120_000,
    }).toString();

    if (auditResult.includes('No known vulnerabilities found')) {
      console.log(`STALE: "${key}": "${value}" — safe to remove`);
      removed.push(key);
    } else {
      console.log(`KEEP:  "${key}": "${value}" — still needed`);
    }
  } catch (err) {
    const output = err.stdout?.toString() || err.stderr?.toString() || '';
    // pnpm audit exits non-zero when vulnerabilities are found
    if (output.includes('vulnerabilit')) {
      console.log(`KEEP:  "${key}": "${value}" — still needed`);
    } else {
      // Install or audit failed for another reason, keep to be safe
      console.log(`KEEP:  "${key}": "${value}" — check failed, keeping`);
    }
  }

  // Restore original package.json for the next iteration
  fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n');
}

if (removed.length === 0) {
  console.log('\nAll overrides are still needed.');
  process.exit(0);
}

// Write final package.json with stale overrides removed
const finalPkg = JSON.parse(JSON.stringify(pkg));
for (const key of removed) {
  delete finalPkg.pnpm.overrides[key];
}
if (Object.keys(finalPkg.pnpm.overrides).length === 0) {
  delete finalPkg.pnpm.overrides;
}
fs.writeFileSync(pkgPath, JSON.stringify(finalPkg, null, 2) + '\n');

console.log(`\nRemoved ${removed.length} stale override(s). Run "pnpm install" to update the lockfile.`);
