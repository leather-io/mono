import { HDKey } from '@scure/bip32';
import { ChainId } from '@stacks/network';
import { AssetString, compressPrivateKey, privateKeyToPublic } from '@stacks/transactions';

import {
  DerivationPathDepth,
  createDescriptor,
  createKeyOriginPath,
  extractAddressIndexFromPath,
} from '@leather.io/crypto';
import type { NetworkModes } from '@leather.io/models';
import { assertIsTruthy, isString, toHexString } from '@leather.io/utils';

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

export function stacksChainIdToCoreNetworkMode(chainId: ChainId): NetworkModes {
  return whenStacksChainId(chainId)({
    [ChainId.Mainnet]: 'mainnet',
    [ChainId.Testnet]: 'testnet',
  });
}

interface WhenStacksChainIdMap<T> {
  [ChainId.Mainnet]: T;
  [ChainId.Testnet]: T;
}
export function whenStacksChainId(chainId: ChainId) {
  return <T>(chainIdMap: WhenStacksChainIdMap<T>): T => chainIdMap[chainId];
}

// From `@stacks/wallet-sdk` package we are trying not to use
export function deriveStxPrivateKey({ keychain, index }: { keychain: HDKey; index: number }) {
  if (keychain.depth !== DerivationPathDepth.Root) throw new Error('Root keychain must be depth 0');
  const accountKeychain = keychain.derive(makeStxDerivationPath(index));
  assertIsTruthy(accountKeychain.privateKey);
  return compressPrivateKey(accountKeychain.privateKey);
}

export function deriveStxPublicKey({
  keychain,
  index,
}: {
  keychain: HDKey;
  index: number;
}): string {
  return privateKeyToPublic(deriveStxPrivateKey({ keychain, index })) as string;
}

export function stacksRootKeychainToAccountDescriptor(keychain: HDKey, accountIndex: number) {
  const fingerprint = toHexString(keychain.fingerprint);
  const publicKey = deriveStxPublicKey({ keychain, index: accountIndex });
  return createDescriptor(
    createKeyOriginPath(fingerprint, makeStxDerivationPath(accountIndex)),
    publicKey
  );
}

export function getStacksBurnAddress(chainIdChainId: ChainId): string {
  switch (chainIdChainId) {
    case ChainId.Mainnet:
      return 'SP00000000000003SCNSJTCSE62ZF4MSE';
    case ChainId.Testnet:
    default:
      return 'ST000000000000000000002AMW42H';
  }
}

export function cleanHex(hexWithMaybePrefix: string): string {
  if (!isString(hexWithMaybePrefix)) return hexWithMaybePrefix;
  return hexWithMaybePrefix.startsWith('0x')
    ? hexWithMaybePrefix.replace('0x', '')
    : hexWithMaybePrefix;
}

export function getPrincipalFromAssetString(assetString: string) {
  return assetString.split('::')[0];
}

export function formatContractId(address: string, name: string) {
  return `${address}.${name}`;
}

interface FormatAssetStringArgs {
  contractAddress: string;
  contractName: string;
  assetName: string;
}
export function formatAssetString({
  contractAddress,
  contractName,
  assetName,
}: FormatAssetStringArgs): AssetString {
  return `${contractAddress}.${contractName}::${assetName}`;
}

/**
 * Gets the contract name.
 *
 * @param identifier - [principal].[contract-name] or [principal].[contract-name]::[asset-name]
 */
export function getStacksContractName(identifier: string): string {
  if (identifier.includes('.')) {
    const parts = identifier?.split('.');
    if (identifier.includes('::')) {
      return parts[1].split('::')[0];
    }
    return parts[1];
  }
  return identifier;
}

/**
 * Gets the asset name.
 *
 * @param identifier - [principal].[contract-name]::[asset-name]
 */
export function getStacksContractAssetName(identifier: string): string {
  if (!identifier.includes('::')) return identifier;
  return identifier.split('::')[1];
}

/**
 * Gets the parts that make up a fully qualified name of an asset.
 *
 * @param identifier - [principal].[contract-name]::[asset-name]
 */
export function getStacksAssetStringParts(identifier: string): {
  contractAddress: string;
  contractAssetName: string;
  contractName: string;
} {
  if (!identifier.includes('.') && !identifier.includes('::')) {
    return {
      contractAddress: identifier,
      contractAssetName: identifier,
      contractName: identifier,
    };
  }

  const contractAddress = identifier.split('.')[0];
  const contractAssetName = getStacksContractAssetName(identifier);
  const contractName = getStacksContractName(identifier);

  return {
    contractAddress,
    contractAssetName,
    contractName,
  };
}
