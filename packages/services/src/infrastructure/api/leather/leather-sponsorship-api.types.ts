import { z } from 'zod';

import { LeatherApiError } from './leather-api.error';

export const sbtcSponsorshipQuoteResponseSchema = z.object({
  quoteId: z.string(),
  feeRecipientPrincipal: z.string(),
  expiresAt: z.string(),
  satsPerStx: z.string(),
  minFeeSats: z.number().int().nonnegative(),
  maxFeeSats: z.number().int().nonnegative(),
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
  'upstream_unavailable',
  'rate_limited',
]);

export type SbtcSponsorshipErrorCode = z.infer<typeof sbtcSponsorshipErrorCodeSchema>;

export function getSbtcSponsorshipErrorCode(error: unknown): SbtcSponsorshipErrorCode | undefined {
  if (!LeatherApiError.isLeatherApiError(error)) return undefined;
  const parsed = sbtcSponsorshipErrorCodeSchema.safeParse(error.data?.code);
  return parsed.success ? parsed.data : undefined;
}

export function getSbtcSponsorshipIneligibilityReason(error: unknown): string | undefined {
  if (!LeatherApiError.isLeatherApiError(error)) return undefined;
  return error.data?.reason;
}
