import BitcoinApp, { DefaultWalletPolicy } from 'ledger-bitcoin';

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
  createNativeSegwitDefaultWalletPolicy,
  createTaprootDefaultWalletPolicy,
} from '../../utils/bitcoin-ledger-utils';

interface GetPolicyForPaymentTypeFactoryArgs {
  derivationPathFn(network: BitcoinNetworkModes, accountIndex: number): string;
  policyFn(policyDetails: WalletPolicyDetails): DefaultWalletPolicy;
}
interface GetExtendedPublicKeyFactoryArgs {
  bitcoinApp: BitcoinApp;
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
    const xpub = await bitcoinApp.getExtendedPubkey(path);
    const policy = policyFn({ xpub, fingerprint, network, accountIndex });
    return { policy: policy.keys[0], xpub, fingerprint, path };
  };
}

const getNativeSegwitExtendedPublicKey = getPolicyForPaymentType({
  derivationPathFn: makeNativeSegwitAccountDerivationPath,
  policyFn: createNativeSegwitDefaultWalletPolicy,
});

const getTaprootExtendedPublicKey = getPolicyForPaymentType({
  derivationPathFn: makeTaprootAccountDerivationPath,
  policyFn: createTaprootDefaultWalletPolicy,
});

interface PullBitcoinKeysFromLedgerDeviceArgs {
  onRequestKey?(keyIndex: number): void;
  network: NetworkModes;
}
export function pullBitcoinKeysFromLedgerDevice(bitcoinApp: BitcoinApp) {
  return async ({ onRequestKey, network }: PullBitcoinKeysFromLedgerDeviceArgs) => {
    const fingerprint = await bitcoinApp.getMasterFingerprint();
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
