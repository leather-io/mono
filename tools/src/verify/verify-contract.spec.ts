import { describe, expect, test } from 'vitest';

import {
  type VerifyRun,
  decideVerdict,
  parseVerifyEnv,
  toVerifyEnv,
  verifyEnvKeys,
  verifyExitCodes,
} from './verify-contract.js';

const run: VerifyRun = {
  feature: 'rpc-get-addresses',
  route: '/get-addresses',
  open: ['HomePage.goToReceiveDialog'],
  session: 'signed-in',
  accountType: 'ledger',
  network: 'testnet4',
  connectTestApp: true,
  flags: { releaseOnramperBuy: true, swapSbtcBridging: false },
  mocksMode: 'list',
  mocks: ['setupMockApis'],
  ready: 'current-account-display-name',
  rpc: { method: 'getAddresses', params: { chains: ['stacks'] } },
  stateSlices: ['active', 'wallets'],
  allowConsoleErrors: true,
  outDir: '/tmp/verify/rpc-get-addresses-20261022-120000',
  readyTimeoutMs: 15_000,
};

describe(toVerifyEnv.name, () => {
  test('round-trips through parseVerifyEnv', () => {
    const env = toVerifyEnv(run);
    expect(env[verifyEnvKeys.run]).toBe('1');
    expect(env[verifyEnvKeys.flags]).toBe('{"releaseOnramperBuy":true,"swapSbtcBridging":false}');
    expect(env[verifyEnvKeys.connectTestApp]).toBe('1');
    expect(parseVerifyEnv(env)).toEqual(run);
  });

  test('carries a catalog id instead of params', () => {
    const catalog: VerifyRun = {
      ...run,
      rpc: { method: 'stx_callContract', catalogId: 'stx_callContract' },
    };
    const env = toVerifyEnv(catalog);
    expect(env[verifyEnvKeys.rpcCatalogId]).toBe('stx_callContract');
    expect(env).not.toHaveProperty(verifyEnvKeys.rpcParams);
    expect(parseVerifyEnv(env).rpc).toEqual({
      method: 'stx_callContract',
      catalogId: 'stx_callContract',
    });
  });

  test('omits optional values and parses them back as undefined', () => {
    const minimal: VerifyRun = {
      route: '/sell',
      open: [],
      session: 'signed-out',
      accountType: 'software',
      network: 'mainnet',
      connectTestApp: false,
      flags: {},
      mocksMode: 'none',
      mocks: [],
      stateSlices: [],
      allowConsoleErrors: false,
      outDir: '/tmp/out',
      readyTimeoutMs: 30_000,
    };
    const env = toVerifyEnv(minimal);
    expect(env).not.toHaveProperty(verifyEnvKeys.feature);
    expect(env).not.toHaveProperty(verifyEnvKeys.ready);
    expect(env).not.toHaveProperty(verifyEnvKeys.rpcMethod);
    expect(parseVerifyEnv(env)).toEqual(minimal);
  });
});

describe(parseVerifyEnv.name, () => {
  test('rejects a run that was not started by the CLI', () => {
    expect(() => parseVerifyEnv({})).toThrowError(/VERIFY_RUN is not set/);
  });

  test('rejects malformed values with the variable name', () => {
    const env = toVerifyEnv(run);
    expect(() => parseVerifyEnv({ ...env, [verifyEnvKeys.flags]: '[]' })).toThrowError(
      /VERIFY_FLAGS must be a JSON object of booleans/
    );
    expect(() => parseVerifyEnv({ ...env, [verifyEnvKeys.session]: 'guest' })).toThrowError(
      /VERIFY_SESSION must be one of signed-in, signed-out, locked/
    );
    expect(() => parseVerifyEnv({ ...env, [verifyEnvKeys.accountType]: 'paper' })).toThrowError(
      /VERIFY_ACCOUNT_TYPE must be one of software, ledger, mixed, policy/
    );
    expect(() => parseVerifyEnv({ ...env, [verifyEnvKeys.readyTimeoutMs]: '0' })).toThrowError(
      /VERIFY_READY_TIMEOUT_MS must be a positive number/
    );
    expect(() => parseVerifyEnv({ ...env, [verifyEnvKeys.connectTestApp]: 'yes' })).toThrowError(
      /VERIFY_CONNECT_TEST_APP must be 1 or 0/
    );
  });
});

describe(decideVerdict.name, () => {
  test('maps readiness and blocking errors to the verdict and exit code table', () => {
    expect(
      decideVerdict({ readyMet: true, blockingErrorCount: 0, allowConsoleErrors: false })
    ).toBe('verified');
    expect(
      decideVerdict({ readyMet: false, blockingErrorCount: 3, allowConsoleErrors: false })
    ).toBe('ready-not-met');
    expect(
      decideVerdict({ readyMet: true, blockingErrorCount: 1, allowConsoleErrors: false })
    ).toBe('errors');
    expect(decideVerdict({ readyMet: true, blockingErrorCount: 1, allowConsoleErrors: true })).toBe(
      'verified'
    );
    expect(verifyExitCodes).toEqual({
      verified: 0,
      usage: 1,
      'ready-not-met': 2,
      errors: 3,
      env: 4,
    });
  });
});
