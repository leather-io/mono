import { getErrorMessages } from '@/features/send/error-messages';
import { Account } from '@/store/accounts/accounts';
import { isDefined } from 'remeda';
import { ZodSafeParseResult } from 'zod';

import { FungibleCryptoAsset, SendAssetActivity } from '@leather.io/models';
import { getBnsService } from '@leather.io/services';

export function recipientSchemaResultContainsError(
  schemaParserResult: ZodSafeParseResult<unknown>,
  messageKey: keyof ReturnType<typeof getErrorMessages>
) {
  return Boolean(
    schemaParserResult.error?.issues.some(issue => issue.message === getErrorMessages()[messageKey])
  );
}

export function getLookupHelperByChain(asset: FungibleCryptoAsset) {
  return {
    bitcoin: getBnsProfileBitcoinPaymentAddress,
    stacks: getBnsProfileStacksAddress,
  }[asset.chain];
}

async function getBnsProfileBitcoinPaymentAddress(bnsName: string, signal: AbortSignal) {
  const profile = await getBnsService().getBnsProfile(bnsName, signal);
  return profile?.profileData.addresses?.bitcoinPayment ?? null;
}

async function getBnsProfileStacksAddress(bnsName: string, signal: AbortSignal) {
  const profile = await getBnsService().getBnsProfile(bnsName, signal);
  return profile?.bnsName.owner ?? null;
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
