import {
  ClarityValue,
  StacksTransactionWire,
  TransactionSigner,
  createStacksPublicKey,
  publicKeyToAddressSingleSig,
} from '@stacks/transactions';

import {
  Signer,
  decomposeDescriptor,
  deriveRootKeychainFromMnemonic,
  extractKeyFromDescriptor,
} from '@leather.io/crypto';
import { NetworkModes } from '@leather.io/models';

import { SignatureData, signMessage, signStructuredDataMessage } from '../message-signing';
import { deriveStxPrivateKey, extractStacksDerivationPathAccountIndex } from '../stacks.utils';

// Warning: mutative. Ideally there would be a tx.clone() method
export function signStacksTransaction(tx: StacksTransactionWire, privateKey: string) {
  const signer = new TransactionSigner(tx);
  signer.signOrigin(privateKey);
  return tx;
}

export type StacksSignerFn = (tx: StacksTransactionWire) => Promise<StacksTransactionWire>;
export type StacksSignMessageFn = (message: string) => Promise<SignatureData>;
export type StacksSignStructuredMessageFn = (
  message: ClarityValue,
  domain: ClarityValue
) => Promise<SignatureData>;

export interface StacksSigner extends Signer {
  descriptor: string;
  keyOrigin: string;
  address: string;
  accountIndex: number;
  network: NetworkModes;
  sign: StacksSignerFn;
  signMessage: StacksSignMessageFn;
  signStructuredMessage: StacksSignStructuredMessageFn;
}

async function getPrivateKey(
  keyOrigin: string,
  getMnemonicFn: () => Promise<{ mnemonic: string; passphrase?: string }>
) {
  const { mnemonic, passphrase } = await getMnemonicFn();
  const keychain = await deriveRootKeychainFromMnemonic(mnemonic, passphrase);
  return deriveStxPrivateKey({
    keychain,
    index: extractStacksDerivationPathAccountIndex(keyOrigin),
  });
}

export function createSignFnFromMnemonic(
  keyOrigin: string,
  getMnemonicFn: () => Promise<{ mnemonic: string; passphrase?: string }>
) {
  return async (tx: StacksTransactionWire) => {
    const privateKey = await getPrivateKey(keyOrigin, getMnemonicFn);
    return signStacksTransaction(tx, privateKey);
  };
}

export function createSignMessageFnFromMnemonic(
  keyOrigin: string,
  getMnemonicFn: () => Promise<{ mnemonic: string; passphrase?: string }>
) {
  return async (message: string) => {
    const privateKey = await getPrivateKey(keyOrigin, getMnemonicFn);
    return signMessage(message, privateKey);
  };
}
export function createSignStructuredDataMessageFnFromMnemonic(
  keyOrigin: string,
  getMnemonicFn: () => Promise<{ mnemonic: string; passphrase?: string }>
) {
  return async (message: ClarityValue, domain: ClarityValue) => {
    const privateKey = await getPrivateKey(keyOrigin, getMnemonicFn);
    return signStructuredDataMessage(message, domain, privateKey);
  };
}

interface InitalizeStacksSignerArgs {
  descriptor: string;
  network: NetworkModes;
  signFn: StacksSignerFn;
  signMessageFn: StacksSignMessageFn;
  signStructuredMessageFn: StacksSignStructuredMessageFn;
}
export function initalizeStacksSigner(args: InitalizeStacksSignerArgs): StacksSigner {
  const { descriptor, network, signFn, signMessageFn, signStructuredMessageFn } = args;

  const publicKey = createStacksPublicKey(extractKeyFromDescriptor(descriptor)).data;

  return {
    ...decomposeDescriptor(descriptor),
    // here we overwrite the accountIndex with the derivation path account index for stx
    accountIndex: extractStacksDerivationPathAccountIndex(descriptor),
    publicKey: publicKey,
    network,
    address: publicKeyToAddressSingleSig(publicKey, network),
    sign: signFn,
    signMessage: signMessageFn,
    signStructuredMessage: signStructuredMessageFn,
  };
}
