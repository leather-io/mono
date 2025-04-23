import { errorMessages } from '@/features/send/error-messages';
import { SafeParseReturnType } from 'zod';

import { FungibleCryptoAssetInfo } from '@leather.io/models';
import { fetchBtcNameOwner, fetchStacksNameOwner } from '@leather.io/query';

export function recipientSchemaResultContainsError(
  schemaParserResult: SafeParseReturnType<any, any>,
  messageKey: keyof typeof errorMessages
) {
  return Boolean(
    schemaParserResult.error?.issues.some(issue => issue.message === errorMessages[messageKey])
  );
}

export function getLookupHelperByChain(assetInfo: FungibleCryptoAssetInfo) {
  return {
    bitcoin: fetchBtcNameOwner,
    stacks: fetchStacksNameOwner,
  }[assetInfo.chain];
}

export function isBnsLookupCandidate(input: string) {
  const bnsNamePattern = /^[a-z0-9-]+\.([a-z0-9-]+)$/i;
  return bnsNamePattern.test(input);
}

export function normalizeSearchTerm(input: string) {
  return input.trim();
}
