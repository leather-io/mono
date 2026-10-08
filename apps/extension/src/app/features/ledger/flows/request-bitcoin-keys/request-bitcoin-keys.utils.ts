import {
  createWalletIdDecoratedPath,
  makeNativeSegwitAccountDerivationPath,
  makeTaprootAccountDerivationPath,
} from '@leather.io/bitcoin';
import type { BitcoinNetworkModes, NetworkModes } from '@leather.io/models';
import { delay } from '@leather.io/utils';

import { defaultNumberOfKeysToPullFromLedgerDevice } from '../../generic-flows/request-keys/use-request-ledger-keys';
import {
  type BitcoinLedgerAccountDetails,
  WalletPolicyDetails,
  createNativeSegwitWalletPolicyKey,
  createTaprootWalletPolicyKey,
} from '../../utils/bitcoin-ledger-utils';
import {
  getExtendedPublicKey,
  getMasterFingerprintHex,
} from '../../utils/bitcoin-signer-kit-utils';
import type { LedgerBitcoinApp } from '../../utils/ledger-app';

interface GetPolicyForPaymentTypeFactoryArgs {
  derivationPathFn(network: BitcoinNetworkModes, accountIndex: number): string;
  policyFn(policyDetails: WalletPolicyDetails): string;
}
interface GetExtendedPublicKeyFactoryArgs {
  bitcoinApp: LedgerBitcoinApp;
  fingerprint: string;
  network: NetworkModes;
  accountIndex: number;
}
function getPolicyForPaymentType({
  derivationPathFn,
  policyFn,
}: GetPolicyForPaymentTypeFactoryArgs) {
  return async ({
    accountIndex,
    bitcoinApp,
    fingerprint,
    network,
  }: GetExtendedPublicKeyFactoryArgs) => {
    const path = derivationPathFn(network, accountIndex);
    const xpub = await getExtendedPublicKey(bitcoinApp, path);
    const policy = policyFn({ xpub, fingerprint, network, accountIndex });
    return { policy, xpub, fingerprint, path };
  };
}

const getNativeSegwitExtendedPublicKey = getPolicyForPaymentType({
  derivationPathFn: makeNativeSegwitAccountDerivationPath,
  policyFn: createNativeSegwitWalletPolicyKey,
});

const getTaprootExtendedPublicKey = getPolicyForPaymentType({
  derivationPathFn: makeTaprootAccountDerivationPath,
  policyFn: createTaprootWalletPolicyKey,
});

interface PullBitcoinKeysFromLedgerDeviceArgs {
  onRequestKey?(keyIndex: number): void;
  network: NetworkModes;
}
export function pullBitcoinKeysFromLedgerDevice(bitcoinApp: LedgerBitcoinApp) {
  return async ({ onRequestKey, network }: PullBitcoinKeysFromLedgerDeviceArgs) => {
    const fingerprint = await getMasterFingerprintHex(bitcoinApp);
    const keys: BitcoinLedgerAccountDetails[] = [];
    for (
      let accountIndex = 0;
      accountIndex < defaultNumberOfKeysToPullFromLedgerDevice;
      accountIndex++
    ) {
      onRequestKey?.(accountIndex);
      const { path, policy } = await getNativeSegwitExtendedPublicKey({
        bitcoinApp,
        fingerprint,
        network,
        accountIndex,
      });
      keys.push({ id: createWalletIdDecoratedPath(path, fingerprint), path, policy, fingerprint });
    }

    for (
      let accountIndex = 0;
      accountIndex < defaultNumberOfKeysToPullFromLedgerDevice;
      accountIndex++
    ) {
      onRequestKey?.(accountIndex + defaultNumberOfKeysToPullFromLedgerDevice);
      const { path, policy } = await getTaprootExtendedPublicKey({
        bitcoinApp,
        fingerprint,
        network,
        accountIndex,
      });
      keys.push({ id: createWalletIdDecoratedPath(path, fingerprint), path, policy, fingerprint });
    }
    await delay(250);
    return { status: 'success', keys, fingerprint };
  };
}
