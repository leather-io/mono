import { z } from 'zod';

export const sbtcSponsorshipNetworkSchema = z.enum(['mainnet', 'testnet']);

export type SbtcSponsorshipNetwork = z.infer<typeof sbtcSponsorshipNetworkSchema>;

export interface SbtcSponsorshipQuoteRequest {
  network: SbtcSponsorshipNetwork;
  origin: string;
}

export const sbtcSponsorshipFeeTiers = ['low', 'medium', 'high'] as const;

export const sbtcSponsorshipFeeTierSchema = z.enum(sbtcSponsorshipFeeTiers);

export type SbtcSponsorshipFeeTier = z.infer<typeof sbtcSponsorshipFeeTierSchema>;

export const sbtcSponsorshipQuoteTierSchema = z.object({
  quoteId: z.string(),
  feeSats: z.number().int().nonnegative(),
  stxFeeMicro: z.number().int().nonnegative(),
});

export type SbtcSponsorshipQuoteTier = z.infer<typeof sbtcSponsorshipQuoteTierSchema>;

export const sbtcSponsorshipQuoteResponseSchema = sbtcSponsorshipQuoteTierSchema.extend({
  sponsorPrincipal: z.string(),
  feeRecipientPrincipal: z.string(),
  expiresAt: z.string(),
  tiers: z.object({
    low: sbtcSponsorshipQuoteTierSchema,
    medium: sbtcSponsorshipQuoteTierSchema,
    high: sbtcSponsorshipQuoteTierSchema,
  }),
});

export type SbtcSponsorshipQuoteResponse = z.infer<typeof sbtcSponsorshipQuoteResponseSchema>;

export interface SbtcSponsorshipSubmitRequest {
  quoteId: string;
  transaction: string;
}

export const sbtcSponsorshipSubmitResponseSchema = z.object({
  txid: z.string(),
  transaction: z.string(),
});

export type SbtcSponsorshipSubmitResponse = z.infer<typeof sbtcSponsorshipSubmitResponseSchema>;

export const sbtcSponsorshipErrorCodeSchema = z.enum([
  'quote_expired',
  'not_eligible',
  'stale_nonce',
  'broadcast_failed',
  'rate_limited',
]);

export type SbtcSponsorshipErrorCode = z.infer<typeof sbtcSponsorshipErrorCodeSchema>;

export const sbtcSponsorshipIneligibilityReasonSchema = z.enum([
  'malformed_transaction',
  'wrong_auth_type',
  'origin_not_single_sig',
  'chain_mismatch',
  'origin_fee_not_zero',
  'bad_origin_signature',
  'wrong_contract',
  'wrong_function',
  'malformed_args',
  'entry_count_mismatch',
  'entry_sender_mismatch',
  'quote_mismatch',
  'bad_transfer_entry',
  'fee_entry_missing',
  'fee_too_low',
  'bad_post_conditions',
  'insufficient_sbtc',
  'float_low',
]);

export type SbtcSponsorshipIneligibilityReason = z.infer<
  typeof sbtcSponsorshipIneligibilityReasonSchema
>;
