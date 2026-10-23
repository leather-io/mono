import { sha256 } from '@noble/hashes/sha256';
import { bytesToHex } from '@stacks/common';
import { ChainId } from '@stacks/network';
import {
  ClarityType,
  type ClarityValue,
  cvToString,
  encodeStructuredData,
} from '@stacks/transactions';

import { stacksChainIdToCoreNetworkMode } from '@leather.io/stacks';
import { capitalize } from '@leather.io/utils';

import { type UnsignedMessageStructured } from '@shared/signature/signature-types';

export function cvToDisplay(cv: ClarityValue): string {
  return cvToString(cv).replaceAll('"', '');
}

export function chainIdToDisplay(chainIdCv: ClarityValue): string | undefined {
  if (chainIdCv.type !== ClarityType.UInt) return undefined;
  const chainIdString = cvToString(chainIdCv);
  const chainId = parseInt(chainIdString.replace('u', ''), 10);
  if (!Object.values(ChainId).includes(chainId)) return undefined;
  return capitalize(stacksChainIdToCoreNetworkMode(chainId));
}

export function deriveStructuredMessageHash({
  domain,
  message,
}: Omit<UnsignedMessageStructured, 'messageType'>) {
  return bytesToHex(sha256(encodeStructuredData({ message, domain })));
}
