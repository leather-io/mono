import { LedgerError } from '@zondax/ledger-stacks';

import { BitcoinAppVersion } from './bitcoin-ledger-utils';
import {
  MINIMUM_STACKS_APP_VERSION,
  MINIMUM_STACKS_APP_VERSION_MULTISIG_ADDRESS,
  StacksAppVersion,
} from './stacks-ledger-utils';
import { stacksVersionGate } from './stacks-version-gate';

function makeStacksAppVersion(version: {
  major: number;
  minor: number;
  patch: number;
}): StacksAppVersion {
  return {
    name: 'Stacks',
    chain: 'stacks',
    returnCode: LedgerError.NoErrors,
    errorMessage: 'No errors',
    testMode: false,
    deviceLocked: false,
    targetId: '',
    ...version,
  };
}

const bitcoinAppVersion: BitcoinAppVersion = {
  name: 'Bitcoin',
  version: '2.1.0',
  flags: 0,
  chain: 'bitcoin',
};

describe(stacksVersionGate.name, () => {
  test('passes bitcoin app versions through without navigating', async () => {
    const toStacksAppOutdatedWarning = vi.fn();

    const passes = await stacksVersionGate({ toStacksAppOutdatedWarning })(bitcoinAppVersion);

    expect(passes).toBe(true);
    expect(toStacksAppOutdatedWarning).not.toHaveBeenCalled();
  });

  test('fails and navigates to the outdated app warning for versions below the minimum', async () => {
    const toStacksAppOutdatedWarning = vi.fn();

    const passes = await stacksVersionGate({ toStacksAppOutdatedWarning })(
      makeStacksAppVersion({ major: 0, minor: 26, patch: 16 })
    );

    expect(passes).toBe(false);
    expect(toStacksAppOutdatedWarning).toHaveBeenCalledOnce();
    expect(toStacksAppOutdatedWarning).toHaveBeenCalledWith({
      currentVersion: '0.26.16',
      requiredVersion: MINIMUM_STACKS_APP_VERSION,
    });
  });

  test('passes stacks app versions at or above the minimum without navigating', async () => {
    const toStacksAppOutdatedWarning = vi.fn();
    const gate = stacksVersionGate({ toStacksAppOutdatedWarning });

    expect(await gate(makeStacksAppVersion({ major: 0, minor: 26, patch: 17 }))).toBe(true);
    expect(await gate(makeStacksAppVersion({ major: 1, minor: 0, patch: 0 }))).toBe(true);
    expect(toStacksAppOutdatedWarning).not.toHaveBeenCalled();
  });

  test('gates on an explicit minimum version and reports it as required', async () => {
    const toStacksAppOutdatedWarning = vi.fn();
    const gate = stacksVersionGate(
      { toStacksAppOutdatedWarning },
      MINIMUM_STACKS_APP_VERSION_MULTISIG_ADDRESS
    );

    expect(await gate(makeStacksAppVersion({ major: 0, minor: 26, patch: 17 }))).toBe(false);
    expect(toStacksAppOutdatedWarning).toHaveBeenCalledWith({
      currentVersion: '0.26.17',
      requiredVersion: MINIMUM_STACKS_APP_VERSION_MULTISIG_ADDRESS,
    });

    expect(await gate(makeStacksAppVersion({ major: 0, minor: 27, patch: 0 }))).toBe(true);
    expect(toStacksAppOutdatedWarning).toHaveBeenCalledOnce();
  });
});
