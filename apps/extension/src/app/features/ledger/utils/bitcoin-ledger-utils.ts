import Transport from '@ledgerhq/hw-transport-webusb';
import BitcoinApp, { DefaultWalletPolicy, PartialSignature } from '@ledgerhq/ledger-bitcoin';
import { Psbt } from 'bitcoinjs-lib';

import {
  makeNativeSegwitAccountDerivationPath,
  makeTaprootAccountDerivationPath,
} from '@leather.io/bitcoin';
import type { BitcoinNetworkModes } from '@leather.io/models';

import { LEDGER_APPS_MAP, promptOpenAppOnDevice } from './generic-ledger-utils';

export interface BitcoinLedgerAccountDetails {
  id: string;
  path: string;
  policy: string;
  fingerprint: string;
}

export function connectLedgerBitcoinApp(network: BitcoinNetworkModes) {
  return async function connectLedgerBitcoinAppImpl() {
    if (network === 'mainnet') {
      await promptOpenAppOnDevice(LEDGER_APPS_MAP.BITCOIN_MAINNET);
    } else if (network === 'testnet') {
      await promptOpenAppOnDevice(LEDGER_APPS_MAP.BITCOIN_TESTNET);
    }

    const transport = await Transport.create();
    return new BitcoinApp(transport);
  };
}

export interface BitcoinAppVersion extends Awaited<ReturnType<BitcoinApp['getAppAndVersion']>> {
  chain: 'bitcoin';
}

export async function getBitcoinAppVersion(app: BitcoinApp): Promise<BitcoinAppVersion> {
  const appVersion = await app.getAppAndVersion();
  return { chain: 'bitcoin' as const, ...appVersion };
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

export function createNativeSegwitDefaultWalletPolicy(policyDetails: WalletPolicyDetails) {
  return new DefaultWalletPolicy(
    'wpkh(@0/**)',
    derivationPathToWalletPolicy(makeNativeSegwitAccountDerivationPath)(policyDetails)
  );
}

export function createTaprootDefaultWalletPolicy(policyDetails: WalletPolicyDetails) {
  return new DefaultWalletPolicy(
    'tr(@0/**)',
    derivationPathToWalletPolicy(makeTaprootAccountDerivationPath)(policyDetails)
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
async function displayDefaultWalletPolicyAddress(
  app: BitcoinApp,
  { network, accountIndex }: DisplayAddressOnDeviceArgs,
  makePath: (network: BitcoinNetworkModes, accountIndex: number) => string,
  createPolicy: (policyDetails: WalletPolicyDetails) => DefaultWalletPolicy
) {
  const fingerprint = await app.getMasterFingerprint();
  const xpub = await app.getExtendedPubkey(makePath(network, accountIndex));
  const walletPolicy = createPolicy({ fingerprint, network, xpub, accountIndex });
  return app.getWalletAddress(
    walletPolicy,
    null,
    receiveAddressChangeIndex,
    receiveAddressIndex,
    true
  );
}

export function displayNativeSegwitAddressOnDevice(app: BitcoinApp) {
  return async (args: DisplayAddressOnDeviceArgs) =>
    displayDefaultWalletPolicyAddress(
      app,
      args,
      makeNativeSegwitAccountDerivationPath,
      createNativeSegwitDefaultWalletPolicy
    );
}

export function displayTaprootAddressOnDevice(app: BitcoinApp) {
  return async (args: DisplayAddressOnDeviceArgs) =>
    displayDefaultWalletPolicyAddress(
      app,
      args,
      makeTaprootAccountDerivationPath,
      createTaprootDefaultWalletPolicy
    );
}

export function addNativeSegwitSignaturesToPsbt(
  psbt: Psbt,
  signatures: [number, PartialSignature][]
) {
  signatures.forEach(([index, signature]) => psbt.updateInput(index, { partialSig: [signature] }));
}

export function addTaprootInputSignaturesToPsbt(
  psbt: Psbt,
  signatures: [number, PartialSignature][]
) {
  signatures.forEach(([index, signature]) =>
    psbt.updateInput(index, { tapKeySig: signature.signature })
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
