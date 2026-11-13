import { execFileSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

import { getMonorepoRoot } from '../utils/paths.js';
import {
  findSensitiveFiles,
  isSensitivePath,
  parseSensitiveGlobs,
  readSensitiveGlobs,
} from './sensitive-paths.js';

const root = getMonorepoRoot();
const sensitiveGlobs = readSensitiveGlobs();

function isSensitive(filePath: string): boolean {
  return isSensitivePath(filePath, sensitiveGlobs);
}

function changed(filename: string, previousFilename?: string) {
  return {
    filename,
    previous_filename: previousFilename,
    status: previousFilename ? 'renamed' : 'modified',
    additions: 1,
    deletions: 0,
  };
}

describe('parseSensitiveGlobs', () => {
  it('reads the quoted globs under the sensitive list', () => {
    expect(parseSensitiveGlobs("sensitive:\n  - 'a/**'\n\n  - 'b.ts'\n")).toEqual(['a/**', 'b.ts']);
  });

  it('rejects a file it cannot fully read, so no glob is silently dropped', () => {
    expect(() => parseSensitiveGlobs("paths:\n  - 'a/**'\n")).toThrow();
    expect(() => parseSensitiveGlobs('sensitive:\n  - a/**\n')).toThrow();
  });
});

describe('findSensitiveFiles', () => {
  it('matches dotfiles and both sides of a rename', () => {
    const globs = ['packages/bitcoin/**'];
    expect(findSensitiveFiles([changed('packages/bitcoin/.eslintrc.js')], globs)).toEqual([
      'packages/bitcoin/.eslintrc.js',
    ]);
    expect(
      findSensitiveFiles([changed('packages/other/a.ts', 'packages/bitcoin/a.ts')], globs)
    ).toEqual(['packages/bitcoin/a.ts']);
    expect(findSensitiveFiles([changed('packages/other/a.ts')], globs)).toEqual([]);
  });
});

describe('sensitive-paths.yml', () => {
  it('only lists globs that match a file in the repo, or guard one that must not appear', () => {
    const guardedAbsentFiles = new Set(['.mcp.json']);
    const tracked = execFileSync('git', ['ls-files'], { cwd: root, encoding: 'utf8' })
      .trim()
      .split('\n');
    for (const glob of sensitiveGlobs.filter(glob => !guardedAbsentFiles.has(glob))) {
      expect(
        tracked.some(filePath => isSensitivePath(filePath, [glob])),
        `${glob} matches no tracked file`
      ).toBe(true);
    }
  });

  it('matches the real key, signing, RPC and manifest files in the repo', () => {
    const paths = [
      'apps/extension/src/shared/crypto/mnemonic-encryption.ts',
      'apps/extension/src/app/store/in-memory-key/keychain-selector-cache.ts',
      'apps/extension/src/app/store/software-keys/software-key.actions.ts',
      'apps/extension/src/app/pages/rpc-sign-psbt/rpc-sign-psbt.tsx',
      'apps/extension/src/app/features/psbt-signer/psbt-signer.tsx',
      'apps/extension/src/app/features/stacks-message-signer/stacks-message-signing.utils.ts',
      'apps/extension/manifest.config.ts',
      'apps/extension/inpage.ts',
      'apps/extension/content-script.ts',
      'apps/web/wrangler.jsonc',
      'packages/models/src/network/network.model.ts',
      'packages/utils/src/money/calculate-money.ts',
      'packages/services/src/coin-selection/bitcoin-coin-selection.service.ts',
      'apps/extension/src/shared/rpc/sign-in-message-veto.ts',
      'apps/extension/src/shared/workers/decryption-worker.ts',
      'apps/extension/src/shared/storage/redux-persist.ts',
      'apps/extension/src/shared/inpage-types.ts',
      'apps/extension/src/app/store/app-permissions/app-permissions.hooks.ts',
      'apps/extension/src/app/store/session-restore.ts',
      'apps/extension/src/app/pages/network/add-network.tsx',
      'apps/extension/src/app/pages/send/send-crypto-asset-form/form/btc/use-propose-btc-send-transaction.ts',
      'apps/mobile/src/features/approver/nonce.section.tsx',
      'apps/mobile/src/features/browser/approver-sheet/sign-psbt.tsx',
      'apps/mobile/src/features/browser/browser/message-routing.ts',
      'apps/mobile/src/features/send/forms/stx/stx-form-schema.ts',
      'apps/mobile/src/store/apps/apps.write.ts',
      'apps/mobile/src/store/migrations/index.ts',
      'apps/mobile/src/store/key-store.ts',
      'apps/mobile/src/hooks/use-authentication.ts',
      'apps/mobile/app.config.ts',
      'apps/mobile/certs/certificate.pem',
      'apps/web/app/root.tsx',
      'apps/web/app/features/multisig/transactions/build-btc-transfer.ts',
      'apps/web/app/features/multisig/network/resolve-stx-chain-id.ts',
      'apps/web/app/features/bitcoin-staking/transactions/pox5-stake.ts',
      'apps/web/app/features/bitcoin-staking/utils/pox5-contracts.ts',
      'apps/web/workers/app.ts',
      'apps/web/workers/csp.ts',
      'apps/mobile/src/store/secure-store/mnemonic-store.ts',
      'apps/mobile/src/store/secure-store/temp-mnemonic-store.ts',
      'tools/src/review-gate/steps.ts',
      'CLAUDE.md',
      'apps/test-app/CLAUDE.md',
    ];
    for (const filePath of paths) {
      expect(existsSync(path.join(root, filePath)), `${filePath} no longer exists`).toBe(true);
      expect(isSensitive(filePath), filePath).toBe(true);
    }
  });

  it('matches dependency manifests, lockfiles, CI tooling and agent configuration anywhere', () => {
    const paths = [
      'package.json',
      'apps/mobile/package.json',
      'pnpm-lock.yaml',
      'pnpm-workspace.yaml',
      'tools/pnpm-workspace.yaml',
      'apps/mobile/ios/Podfile.lock',
      'tools/package-lock.json',
      'tools/src/lt.ts',
      'tools/bin/lt.js',
      'tools/src/ci/github.ts',
      'tools/src/claude-review/prompts.ts',
      'apps/web/wrangler.toml',
      '.github/workflows/repo:code-checks.yml',
      '.claude/skills/pr-review/SKILL.md',
      '.mcp.json',
      'apps/test-app/CLAUDE.md',
      'apps/mobile/src/store/keychains/keychains.write.ts',
      'apps/mobile/src/features/UseMnemonicSheet.tsx',
    ];
    for (const filePath of paths) expect(isSensitive(filePath), filePath).toBe(true);
  });

  it('leaves display code next to the transaction files to the model', () => {
    const paths = [
      'apps/web/app/features/multisig/activity/multisig-transaction-activity-view.ts',
      'apps/web/app/features/bitcoin-staking/components/pox5-tx-status-screen.tsx',
      'apps/mobile/src/features/send/forms/stx/stx-form.tsx',
      'apps/extension/src/app/pages/send/send-crypto-asset-form/form/stx/stx-send-form.tsx',
      'packages/ui/src/components/button/button.web.tsx',
      'apps/web/app/pages/home/home.tsx',
      'README.md',
    ];
    for (const filePath of paths) expect(isSensitive(filePath), filePath).toBe(false);
  });
});
