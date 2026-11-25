import { z } from 'zod';

import { ChainId } from '@leather.io/models';

import { LeatherApiError } from './leather-api.error';
import type { paths } from './leather-api.types';

export type SbtcSponsorshipQuoteResponse =
  paths['/v1/sponsorship/quote']['post']['responses'][200]['content']['application/json'];

const sbtcSponsorshipErrorCodeSchema = z.enum([
  'quote_expired',
  'not_eligible',
  'stale_nonce',
  'funding_pending',
  'broadcast_failed',
  'upstream_unavailable',
]);

export function getSbtcSponsorshipNetwork(chainId: number) {
  if (chainId === ChainId.Mainnet) return 'mainnet';
  if (chainId === ChainId.Testnet) return 'testnet';
  return undefined;
}

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
