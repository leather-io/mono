import type { DeviceManagementKit } from '@ledgerhq/device-management-kit';
import { DefaultDescriptorTemplate, DefaultWallet } from '@ledgerhq/device-signer-kit-bitcoin';
import { Psbt } from 'bitcoinjs-lib';

import {
  makeNativeSegwitAccountDerivationPath,
  makeTaprootAccountDerivationPath,
} from '@leather.io/bitcoin';
import type { BitcoinNetworkModes } from '@leather.io/models';

import type { RunLedgerDeviceAction } from '../dmk/ledger-device-action';
import {
  type ConnectLedgerDeviceOptions,
  connectLedgerDeviceToApp,
  getAppAndVersion,
} from '../dmk/ledger-device-connection';
import {
  type PartialSignature,
  createLedgerBitcoinApp,
  getWalletAddressOnDevice,
  toSignerKitDerivationPath,
} from './bitcoin-signer-kit-utils';
import { LEDGER_APPS_MAP } from './generic-ledger-utils';
import type { LedgerBitcoinApp } from './ledger-app';

export interface BitcoinLedgerAccountDetails {
  id: string;
  path: string;
  policy: string;
  fingerprint: string;
}

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

export interface BitcoinAppVersion {
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

export interface WalletPolicyDetails {
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

const receiveAddressChangeIndex = 0;
const receiveAddressIndex = 0;

interface DisplayAddressOnDeviceArgs {
  network: BitcoinNetworkModes;
  accountIndex: number;
}

// Displays the account's receive address on the Ledger screen using the
// device's own xpub, so a wrong device produces a mismatch rather than a
// confirmation. Returns the address the device showed for the caller to assert
// against the locally derived one.
async function displayDefaultWalletAddress(
  app: LedgerBitcoinApp,
  { network, accountIndex }: DisplayAddressOnDeviceArgs,
  makeDefaultWallet: (network: BitcoinNetworkModes, accountIndex: number) => DefaultWallet
) {
  return getWalletAddressOnDevice(app, makeDefaultWallet(network, accountIndex), {
    changeIndex: receiveAddressChangeIndex,
    addressIndex: receiveAddressIndex,
  });
}

export function displayNativeSegwitAddressOnDevice(app: LedgerBitcoinApp) {
  return async (args: DisplayAddressOnDeviceArgs) =>
    displayDefaultWalletAddress(app, args, makeNativeSegwitDefaultWallet);
}

export function displayTaprootAddressOnDevice(app: LedgerBitcoinApp) {
  return async (args: DisplayAddressOnDeviceArgs) =>
    displayDefaultWalletAddress(app, args, makeTaprootDefaultWallet);
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
