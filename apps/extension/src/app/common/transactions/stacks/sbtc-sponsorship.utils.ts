import { SBTC_ASSET_ID_MAINNET, SBTC_ASSET_ID_TESTNET } from '@leather.io/constants';
import { FeeTypes } from '@leather.io/models';
import {
  type SbtcSponsorshipErrorCode,
  type SbtcSponsorshipFeeTier,
  type SbtcSponsorshipIneligibilityReason,
  getErrorDetail,
  getSbtcSponsorshipErrorCode,
  getSbtcSponsorshipIneligibilityReason,
} from '@leather.io/services';
import { getPrincipalFromAssetString } from '@leather.io/stacks';

const sbtcContractPrincipals = [SBTC_ASSET_ID_MAINNET, SBTC_ASSET_ID_TESTNET].map(
  getPrincipalFromAssetString
);

export function isSbtcContractPrincipal(contractId: string) {
  return sbtcContractPrincipals.includes(contractId);
}

export const sponsoredTransactionBroadcastRefusedMessage =
  'Sponsored transactions are submitted through the sponsor and cannot be broadcast by the wallet';

const unknownSbtcSponsorshipErrorMessage = 'Something went wrong';

const sbtcSponsorshipErrorMessages: Record<SbtcSponsorshipErrorCode, string> = {
  quote_expired: 'The sBTC fee quote expired. Review the updated fee and confirm again.',
  stale_nonce: 'The account nonce changed. Review the updated transaction and confirm again.',
  not_eligible: "This transfer isn't eligible for sBTC fee payment",
  broadcast_failed:
    "The sponsor couldn't broadcast the transaction. Your sBTC hasn't moved. Try again in a moment.",
  upstream_unavailable:
    "The sponsor couldn't reach the Stacks network. Your sBTC hasn't moved. Try again in a moment.",
  rate_limited: 'Too many requests. Wait a moment and try again.',
};

const sbtcSponsorshipIneligibilityMessages: Partial<
  Record<SbtcSponsorshipIneligibilityReason, string>
> = {
  insufficient_sbtc: 'Your sBTC balance no longer covers the amount plus the fee.',
  bad_transfer_entry: 'The amount must be positive and the recipient cannot be your own address.',
  fee_too_low: 'The quoted fee is out of date. Review the updated fee and confirm again.',
  float_low: 'The sponsor is temporarily out of STX. Pay the fee in STX or try again later.',
};

export function getSbtcSponsorshipErrorMessage(error: unknown): string {
  const code = getSbtcSponsorshipErrorCode(error);
  if (code === 'not_eligible') {
    const reason = getSbtcSponsorshipIneligibilityReason(error);
    const message = sbtcSponsorshipErrorMessages[code];
    if (!reason) return message;
    const reasonMessage = sbtcSponsorshipIneligibilityMessages[reason];
    return reasonMessage ? `${message}. ${reasonMessage}` : `${message} (${reason})`;
  }
  if (code) return sbtcSponsorshipErrorMessages[code];
  return getErrorDetail(error) ?? unknownSbtcSponsorshipErrorMessage;
}

const defaultSbtcSponsorshipFeeTier: SbtcSponsorshipFeeTier = 'medium';

const sbtcSponsorshipFeeTierByFeeType: Partial<Record<string, SbtcSponsorshipFeeTier>> = {
  [FeeTypes[FeeTypes.Low]]: 'low',
  [FeeTypes[FeeTypes.Middle]]: 'medium',
  [FeeTypes[FeeTypes.High]]: 'high',
};

export function isSbtcSponsorshipFeeType(feeType: string) {
  return feeType in sbtcSponsorshipFeeTierByFeeType;
}

export function getSbtcSponsorshipFeeTier(feeType: string): SbtcSponsorshipFeeTier {
  return sbtcSponsorshipFeeTierByFeeType[feeType] ?? defaultSbtcSponsorshipFeeTier;
}
