import type { DeviceManagementKit } from '@ledgerhq/device-management-kit';
import { DefaultDescriptorTemplate, DefaultWallet } from '@ledgerhq/device-signer-kit-bitcoin';
import { type Psbt } from 'bitcoinjs-lib';

import {
  makeNativeSegwitAccountDerivationPath,
  makeTaprootAccountDerivationPath,
} from '@leather.io/bitcoin';
import type { BitcoinNetworkModes } from '@leather.io/models';

import { LEDGER_APPS_MAP } from '../app/generic-ledger-utils';
import type { LedgerBitcoinApp } from '../app/ledger-app';
import type { RunLedgerDeviceAction } from '../dmk/ledger-device-action';
import {
  type ConnectLedgerDeviceOptions,
  connectLedgerDeviceToApp,
  getAppAndVersion,
} from '../dmk/ledger-device-connection';
import {
  type PartialSignature,
  createLedgerBitcoinApp,
  toSignerKitDerivationPath,
} from './bitcoin-signer-kit-utils';

function bitcoinAppNameForNetwork(network: BitcoinNetworkModes): string | null {
  if (network === 'mainnet') return LEDGER_APPS_MAP.BITCOIN_MAINNET;
  if (network === 'testnet') return LEDGER_APPS_MAP.BITCOIN_TESTNET;
  return null;
}

export function connectLedgerBitcoinApp(
  dmk: DeviceManagementKit,
  network: BitcoinNetworkModes,
  runAction?: RunLedgerDeviceAction
) {
  return async function connectLedgerBitcoinAppImpl(
    options?: ConnectLedgerDeviceOptions
  ): Promise<LedgerBitcoinApp> {
    const sessionId = await connectLedgerDeviceToApp(dmk, bitcoinAppNameForNetwork(network), {
      ...options,
      runAction,
    });
    return createLedgerBitcoinApp(dmk, sessionId, runAction);
  };
}

interface BitcoinAppVersion {
  chain: 'bitcoin';
  name: string;
  version: string;
}

export function getBitcoinAppVersion(dmk: DeviceManagementKit) {
  return async function getBitcoinAppVersionImpl(
    app: LedgerBitcoinApp
  ): Promise<BitcoinAppVersion> {
    const { name, version } = await getAppAndVersion(dmk, app.sessionId);
    return { chain: 'bitcoin', name, version };
  };
}

interface WalletPolicyDetails {
  fingerprint: string;
  network: BitcoinNetworkModes;
  xpub: string;
  accountIndex: number;
}

// Function that takes a derivation path generator fn and uses that to derive a
// wallet policy string from it
// E.g.[844b93a0/84'/0'/2']xpub6CQGqQ…gNfC21xp8r
function derivationPathToWalletPolicy(
  makePath: (network: BitcoinNetworkModes, accountIndex: number) => string
) {
  return ({ network, accountIndex, fingerprint, xpub }: WalletPolicyDetails) =>
    '[' + makePath(network, accountIndex).replace('m', fingerprint) + ']' + xpub;
}

export function createNativeSegwitWalletPolicyKey(policyDetails: WalletPolicyDetails) {
  return derivationPathToWalletPolicy(makeNativeSegwitAccountDerivationPath)(policyDetails);
}

export function createTaprootWalletPolicyKey(policyDetails: WalletPolicyDetails) {
  return derivationPathToWalletPolicy(makeTaprootAccountDerivationPath)(policyDetails);
}

export function makeNativeSegwitDefaultWallet(network: BitcoinNetworkModes, accountIndex: number) {
  return new DefaultWallet(
    toSignerKitDerivationPath(makeNativeSegwitAccountDerivationPath(network, accountIndex)),
    DefaultDescriptorTemplate.NATIVE_SEGWIT
  );
}

export function makeTaprootDefaultWallet(network: BitcoinNetworkModes, accountIndex: number) {
  return new DefaultWallet(
    toSignerKitDerivationPath(makeTaprootAccountDerivationPath(network, accountIndex)),
    DefaultDescriptorTemplate.TAPROOT
  );
}

export function addNativeSegwitSignaturesToPsbt(psbt: Psbt, signatures: PartialSignature[]) {
  signatures.forEach(({ inputIndex, pubkey, signature }) =>
    psbt.updateInput(inputIndex, { partialSig: [{ pubkey, signature }] })
  );
}

export function addTaprootInputSignaturesToPsbt(psbt: Psbt, signatures: PartialSignature[]) {
  signatures.forEach(({ inputIndex, signature }) =>
    psbt.updateInput(inputIndex, { tapKeySig: signature })
  );
}

export function isBitcoinAppOpen({ network }: { network: BitcoinNetworkModes }) {
  return function isBitcoinAppOpenByName({ name }: { name: string }) {
    if (network === 'mainnet') {
      return name === LEDGER_APPS_MAP.BITCOIN_MAINNET;
    }
    return name === LEDGER_APPS_MAP.BITCOIN_TESTNET;
  };
}
