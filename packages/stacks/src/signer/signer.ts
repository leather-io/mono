import {
  AddressVersion,
  StacksTransaction,
  TransactionSigner,
  createStacksPrivateKey,
  createStacksPublicKey,
  publicKeyToAddress,
} from '@stacks/transactions';

import {
  Signer,
  decomposeDescriptor,
  deriveRootKeychainFromMnemonic,
  extractKeyFromDescriptor,
} from '@leather.io/crypto';
import { NetworkModes } from '@leather.io/models';
import { whenNetwork } from '@leather.io/utils';

import { deriveStxPrivateKey, extractStacksDerivationPathAccountIndex } from '../stacks.utils';

// Warning: mutatitive. Ideally there would be a tx.clone() method
export function signStacksTransaction(tx: StacksTransaction, privateKey: string) {
  const signer = new TransactionSigner(tx);
  signer.signOrigin(createStacksPrivateKey(privateKey));
  return tx;
}

export type StacksSignerFn = (tx: StacksTransaction) => Promise<StacksTransaction>;

export interface StacksSigner extends Signer {
  descriptor: string;
  keyOrigin: string;
  address: string;
  accountIndex: number;
  network: NetworkModes;
  sign: StacksSignerFn;
}

export function createSignFnFromMnemonic(
  keyOrigin: string,
  getMnemonicFn: () => Promise<{ mnemonic: string; passphrase?: string }>
) {
  return async (tx: StacksTransaction) => {
    const { mnemonic, passphrase } = await getMnemonicFn();
    const keychain = await deriveRootKeychainFromMnemonic(mnemonic, passphrase);
    const privateKey = deriveStxPrivateKey({
      keychain,
      index: extractStacksDerivationPathAccountIndex(keyOrigin),
    });
    return signStacksTransaction(tx, privateKey);
  };
}

interface InitalizeStacksSignerArgs {
  descriptor: string;
  network: NetworkModes;
  signFn: StacksSignerFn;
}
export function initalizeStacksSigner(args: InitalizeStacksSignerArgs): StacksSigner {
  const { descriptor, network, signFn } = args;

  const publicKey = createStacksPublicKey(extractKeyFromDescriptor(descriptor));

  return {
    ...decomposeDescriptor(descriptor),
    // here we overwrite the accountIndex with the derivation path account index for stx
    accountIndex: extractStacksDerivationPathAccountIndex(descriptor),
    publicKey: publicKey.data,
    network,
    address: publicKeyToAddress(
      whenNetwork(network)({
        mainnet: AddressVersion.MainnetSingleSig,
        testnet: AddressVersion.TestnetSingleSig,
      }),
      publicKey
    ),
    sign: signFn,
  };
}
