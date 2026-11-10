import type { ClarityValue, StacksTransactionWire } from '@stacks/transactions';

import type { BitcoinNetworkModes } from '@leather.io/models';
import type { SignatureData, StacksDerivationPathType } from '@leather.io/stacks';

import { HardwareWalletError } from './hardware-wallet-errors';
import type { OperationContext } from './hardware-wallet-interaction';

export type HardwareWalletVendor = 'ledger';

const noBitcoinSigner = 'The connected hardware wallet session has no Bitcoin signer';
const noStacksSigner = 'The connected hardware wallet session has no Stacks signer';

export interface HardwareWalletBitcoinCapabilities {
  taproot: boolean;
  descriptorPolicies: boolean;
  maxInputs?: number;
}

export interface HardwareWalletStacksCapabilities {
  structuredMessages: boolean;
  minimumAppVersion?: string;
}

export interface HardwareWalletCapabilities {
  bitcoin: HardwareWalletBitcoinCapabilities | null;
  stacks: HardwareWalletStacksCapabilities | null;
  addressVerification: boolean;
}

export type HardwareBitcoinAccountStandard = 'nativeSegwit' | 'taproot';

export interface HardwareBitcoinKeyRequestProgress {
  standard: HardwareBitcoinAccountStandard;
  accountIndex: number;
}

export interface RequestBitcoinAccountKeysArgs {
  network: BitcoinNetworkModes;
  accountIndexes: number[];
  standards: HardwareBitcoinAccountStandard[];
  onRequestKey?(progress: HardwareBitcoinKeyRequestProgress): void;
}

export interface HardwareBitcoinAccountKey {
  standard: HardwareBitcoinAccountStandard;
  accountIndex: number;
  path: string;
  xpub: string;
  descriptor: string;
}

export interface HardwareBitcoinAccountKeys {
  fingerprint: string;
  keys: HardwareBitcoinAccountKey[];
}

export interface HardwareBitcoinInputToSign {
  index: number;
  derivationPath: string;
  publicKey: Uint8Array;
}

export interface SignBitcoinPsbtArgs {
  psbt: Uint8Array;
  network: BitcoinNetworkModes;
  inputsToSign: HardwareBitcoinInputToSign[];
  policyDescriptor?: string;
}

interface ShowBitcoinAccountAddressArgs {
  kind: 'account';
  network: BitcoinNetworkModes;
  standard: HardwareBitcoinAccountStandard;
  accountIndex: number;
  changeIndex: number;
  addressIndex: number;
}

interface ShowBitcoinPolicyAddressArgs {
  kind: 'policy';
  policyDescriptor: string;
  changeIndex: number;
  addressIndex: number;
}

export type ShowBitcoinAddressArgs = ShowBitcoinAccountAddressArgs | ShowBitcoinPolicyAddressArgs;

export interface HardwareBitcoinSigner {
  requestAccountKeys(
    args: RequestBitcoinAccountKeysArgs,
    ctx: OperationContext
  ): Promise<HardwareBitcoinAccountKeys>;
  signPsbt(args: SignBitcoinPsbtArgs, ctx: OperationContext): Promise<Uint8Array>;
  showAddress(args: ShowBitcoinAddressArgs, ctx: OperationContext): Promise<string>;
}

export interface RequestStacksAccountKeysArgs {
  derivationPathType: StacksDerivationPathType;
  accountIndexes: number[];
  onRequestKey?(accountIndex: number): void;
}

export interface HardwareStacksAccountKey {
  accountIndex: number;
  path: string;
  publicKey: string;
  descriptor: string;
}

export interface HardwareStacksAccountKeys {
  fingerprint: string;
  keys: HardwareStacksAccountKey[];
}

export interface HardwareStacksKey {
  derivationPath: string;
  publicKey: string;
}

export interface SignStacksTransactionArgs {
  transaction: StacksTransactionWire;
  key: HardwareStacksKey;
}

export interface SignStacksMessageArgs {
  message: string;
  key: HardwareStacksKey;
}

export interface SignStacksStructuredMessageArgs {
  message: ClarityValue;
  domain: ClarityValue;
  key: HardwareStacksKey;
}

export interface ShowStacksAddressArgs {
  derivationPath: string;
  chainId: number;
}

export interface HardwareStacksSigner {
  requestAccountKeys(
    args: RequestStacksAccountKeysArgs,
    ctx: OperationContext
  ): Promise<HardwareStacksAccountKeys>;
  signTransaction(
    args: SignStacksTransactionArgs,
    ctx: OperationContext
  ): Promise<StacksTransactionWire>;
  signMessage(args: SignStacksMessageArgs, ctx: OperationContext): Promise<SignatureData>;
  signStructuredMessage(
    args: SignStacksStructuredMessageArgs,
    ctx: OperationContext
  ): Promise<SignatureData>;
  showAddress(args: ShowStacksAddressArgs, ctx: OperationContext): Promise<string>;
}

export interface HardwareWallet {
  vendor: HardwareWalletVendor;
  capabilities: HardwareWalletCapabilities;
  bitcoin: HardwareBitcoinSigner | null;
  stacks: HardwareStacksSigner | null;
  getMasterFingerprint(ctx: OperationContext): Promise<string>;
}

export function getBitcoinSigner(wallet: HardwareWallet): HardwareBitcoinSigner {
  if (!wallet.bitcoin) throw new HardwareWalletError('unsupported', { message: noBitcoinSigner });
  return wallet.bitcoin;
}

export function getStacksSigner(wallet: HardwareWallet): HardwareStacksSigner {
  if (!wallet.stacks) throw new HardwareWalletError('unsupported', { message: noStacksSigner });
  return wallet.stacks;
}
