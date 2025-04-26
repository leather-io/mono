import { errorMessages } from '@/features/send/error-messages';
import { Account } from '@/store/accounts/accounts';
import { isDefined } from 'remeda';
import { SafeParseReturnType } from 'zod';

import { FungibleCryptoAssetInfo, SendAssetActivity } from '@leather.io/models';
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

export function activityContainsRecipient(activity: SendAssetActivity[], recipientAddress: string) {
  return activity.some(
    activity => isDefined(activity.receivers[0]) && activity.receivers[0] === recipientAddress
  );
}

export interface IsNewAddressParams {
  address: string;
  findAccountByAddress: (address: string) => Account | null;
  activity?: SendAssetActivity[];
}

export function isNewAddress({ address, activity = [], findAccountByAddress }: IsNewAddressParams) {
  return !activityContainsRecipient(activity, address) && !findAccountByAddress(address);
}
