import { BitcoinAppVersion } from './bitcoin-ledger-utils';
import {
  MINIMUM_STACKS_APP_VERSION,
  StacksAppVersion,
  validateStacksAppVersion,
} from './stacks-ledger-utils';

interface StacksVersionGateNavigate {
  toStacksAppOutdatedWarning(versionInfo: {
    currentVersion: string;
    requiredVersion: string;
  }): void;
}

export function stacksVersionGate(
  ledgerNavigate: StacksVersionGateNavigate,
  minimumVersion = MINIMUM_STACKS_APP_VERSION
) {
  return (appVersion: StacksAppVersion | BitcoinAppVersion): Promise<boolean> => {
    if (appVersion.chain !== 'stacks') return Promise.resolve(true);

    const { meetsMinimum, currentVersion } = validateStacksAppVersion(appVersion, minimumVersion);
    if (!meetsMinimum) {
      ledgerNavigate.toStacksAppOutdatedWarning({
        currentVersion,
        requiredVersion: minimumVersion,
      });
      return Promise.resolve(false);
    }

    return Promise.resolve(true);
  };
}
