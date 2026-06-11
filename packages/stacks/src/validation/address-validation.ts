import { c32addressDecode } from 'c32check';
import { z } from 'zod';

import { ChainId } from '@leather.io/models';
import { isEmptyString, isString, isUndefined } from '@leather.io/utils';

// taken from stacks-utils.ts
export function isValidStacksAddress(address: string) {
  if (isUndefined(address) || isEmptyString(address)) {
    return false;
  }
  try {
    c32addressDecode(address);
    return true;
  } catch {
    return false;
  }
}

export function isValidAddressChain(address: string, chainId: number) {
  if (!address) {
    return false;
  }

  const prefix = address.slice(0, 2);
  switch (chainId) {
    case ChainId.Mainnet:
      return prefix === 'SM' || prefix === 'SP';
    case ChainId.Testnet:
    default:
      return prefix === 'SN' || prefix === 'ST';
  }
}

export function validatePayerNotRecipient(senderAddress: string, recipientAddress: string) {
  if (!senderAddress || !recipientAddress) {
    return false;
  }

  return senderAddress !== recipientAddress;
}

export const standardPrincipalSchema = z.string().refine(
  (address: unknown) => {
    if (!isString(address)) return false;
    if (!isValidStacksAddress(address)) return false;
    return !address.includes('.');
  },
  { message: 'Invalid standard Stacks principal address' }
);

export const contractPrincipalSchema = z.string().refine(
  (principal: unknown) => {
    if (!isString(principal)) return false;

    const parts = principal.split('.');
    if (parts.length !== 2) return false;

    const [address, contractName] = parts;

    if (!isValidStacksAddress(address)) return false;

    const contractNameRegex = /^[a-zA-Z0-9_-]{1,128}$/;
    return contractNameRegex.test(contractName);
  },
  { message: 'Invalid contract principal (must be address.contract-name format)' }
);

export const principalSchema = z.union([standardPrincipalSchema, contractPrincipalSchema]);

export type PrincipalType = 'standard' | 'contract';

export function inferPrincipalTypeFromAddress(principal: string): PrincipalType | 'invalid' {
  if (contractPrincipalSchema.safeParse(principal).success) return 'contract';
  if (principalSchema.safeParse(principal).success) return 'standard';
  return 'invalid';
}
