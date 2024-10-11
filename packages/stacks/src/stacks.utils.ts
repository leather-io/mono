import { bytesToHex } from '@noble/hashes/utils';
import { HDKey } from '@scure/bip32';
import { compressPrivateKey } from '@stacks/encryption';
import { ChainID, createStacksPrivateKey, getPublicKey } from '@stacks/transactions';

import {
  DerivationPathDepth,
  createDescriptor,
  createKeyOriginPath,
  extractAddressIndexFromPath,
} from '@leather.io/crypto';
import type { NetworkModes } from '@leather.io/models';
import { assertIsTruthy, toHexString } from '@leather.io/utils';

export const stxDerivationWithAccount = `m/44'/5757'/0'/0/{account}`;

export function makeAccountIndexDerivationPathFactory(derivationPath: string) {
  return (account: number) => derivationPath.replace('{account}', account.toString());
}

export function extractStacksDerivationPathAccountIndex(path: string) {
  if (!path.includes('5757')) throw new Error('Not a valid Stacks derivation path: ' + path);
  return extractAddressIndexFromPath(path);
}

/**
 * Stacks accounts always use the same derivation path, regardless of network
 */
export const makeStxDerivationPath =
  makeAccountIndexDerivationPathFactory(stxDerivationWithAccount);

export function stacksChainIdToCoreNetworkMode(chainId: ChainID): NetworkModes {
  return whenStacksChainId(chainId)({ [ChainID.Mainnet]: 'mainnet', [ChainID.Testnet]: 'testnet' });
}

interface WhenStacksChainIdMap<T> {
  [ChainID.Mainnet]: T;
  [ChainID.Testnet]: T;
}
export function whenStacksChainId(chainId: ChainID) {
  return <T>(chainIdMap: WhenStacksChainIdMap<T>): T => chainIdMap[chainId];
}

// From `@stacks/wallet-sdk` package we are trying not to use
export function deriveStxPrivateKey({ keychain, index }: { keychain: HDKey; index: number }) {
  if (keychain.depth !== DerivationPathDepth.Root) throw new Error('Root keychain must be depth 0');
  const accountKeychain = keychain.derive(makeStxDerivationPath(index));
  assertIsTruthy(accountKeychain.privateKey);
  return bytesToHex(compressPrivateKey(accountKeychain.privateKey));
}

export function deriveStxPublicKey({ keychain, index }: { keychain: HDKey; index: number }) {
  return getPublicKey(createStacksPrivateKey(deriveStxPrivateKey({ keychain, index })));
}

export function stacksRootKeychainToAccountDescriptor(keychain: HDKey, accountIndex: number) {
  const fingerprint = toHexString(keychain.fingerprint);
  const publicKey = deriveStxPublicKey({ keychain, index: accountIndex });
  return createDescriptor(
    createKeyOriginPath(fingerprint, makeStxDerivationPath(accountIndex)),
    bytesToHex(publicKey.data)
  );
}

export function getStacksBurnAddress(chainId: ChainID): string {
  switch (chainId) {
    case ChainID.Mainnet:
      return 'SP00000000000003SCNSJTCSE62ZF4MSE';
    case ChainID.Testnet:
    default:
      return 'ST000000000000000000002AMW42H';
  }
}
