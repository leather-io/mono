import { NetworkModes } from '@leather-wallet/constants';

// Partially imported utils from extension repo
export const defaultWalletKeyId = 'default' as const;

type NetworkMap<T> = Record<NetworkModes, T>;

export function whenNetwork(mode: NetworkModes) {
  return <T extends NetworkMap<unknown>>(networkMap: T) => networkMap[mode] as T[NetworkModes];
}

export function isString(value: unknown): value is string {
  return typeof value === 'string';
}
