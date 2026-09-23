import type { BrowserContext, Page, Route } from '@playwright/test';

import {
  SBTC_EMILY_API_URL,
  TEST_ACCOUNT_1_STX_ADDRESS_HEX,
  TEST_ACCOUNT_2_STX_ADDRESS,
} from './constants';

const sbtcEmilyUrl = `${SBTC_EMILY_API_URL}/deposit*`;
const sbtcSponsorshipQuoteUrl = '**/v1/sponsorship/quote';
const sbtcSponsorshipSubmitUrl = '**/v1/sponsorship/submit';

export const SBTC_SPONSORSHIP_TXID =
  '9b709768122e6c62a37b087106cc9c23280ed6242b565484b6cc4e6a43ae1155';

export type SbtcSponsorshipFeeTier = 'low' | 'medium' | 'high';

export const SBTC_SPONSORSHIP_FEE_SATS_BY_TIER: Record<SbtcSponsorshipFeeTier, number> = {
  low: 1000,
  medium: 1500,
  high: 3000,
};

const sbtcSponsorshipStxFeeMicroByTier: Record<SbtcSponsorshipFeeTier, number> = {
  low: 120_000,
  medium: 180_000,
  high: 360_000,
};

export type SbtcDepositStatus = 'pending' | 'accepted' | 'confirmed' | 'failed' | 'rbf';

export interface SbtcDepositFixture {
  amount: number;
  bitcoinTxOutputIndex: number;
  bitcoinTxid: string;
  depositScript: string;
  lastUpdateBlockHash: string;
  lastUpdateHeight: number;
  recipient: string;
  reclaimScript: string;
  status: SbtcDepositStatus;
}

interface CreateSbtcDepositFixtureArgs {
  bitcoinTxid: string;
  status: SbtcDepositStatus;
  amount?: number;
  recipient?: string;
}

export function createSbtcDepositFixture({
  bitcoinTxid,
  status,
  amount = 150_000,
  recipient = TEST_ACCOUNT_1_STX_ADDRESS_HEX,
}: CreateSbtcDepositFixtureArgs): SbtcDepositFixture {
  return {
    amount,
    bitcoinTxOutputIndex: 0,
    bitcoinTxid,
    depositScript: '0x00',
    lastUpdateBlockHash: '0x01',
    lastUpdateHeight: 810600,
    recipient,
    reclaimScript: '0x02',
    status,
  };
}

interface SbtcSponsorshipQuoteTierFixture {
  quoteId: string;
  feeSats: number;
  stxFeeMicro: number;
}

interface SbtcSponsorshipQuoteFixture extends SbtcSponsorshipQuoteTierFixture {
  sponsorPrincipal: string;
  feeRecipientPrincipal: string;
  expiresAt: string;
  tiers: Record<SbtcSponsorshipFeeTier, SbtcSponsorshipQuoteTierFixture>;
}

export function sbtcSponsorshipQuoteId(tier: SbtcSponsorshipFeeTier) {
  return `quote-${tier}`;
}

function createSbtcSponsorshipQuoteTierFixture(
  tier: SbtcSponsorshipFeeTier,
  feeSats: number
): SbtcSponsorshipQuoteTierFixture {
  return {
    quoteId: sbtcSponsorshipQuoteId(tier),
    feeSats,
    stxFeeMicro: sbtcSponsorshipStxFeeMicroByTier[tier],
  };
}

export function createSbtcSponsorshipQuoteFixture(
  feeSatsByTier: Record<SbtcSponsorshipFeeTier, number> = SBTC_SPONSORSHIP_FEE_SATS_BY_TIER
): SbtcSponsorshipQuoteFixture {
  const tiers = {
    low: createSbtcSponsorshipQuoteTierFixture('low', feeSatsByTier.low),
    medium: createSbtcSponsorshipQuoteTierFixture('medium', feeSatsByTier.medium),
    high: createSbtcSponsorshipQuoteTierFixture('high', feeSatsByTier.high),
  };
  return {
    ...tiers.medium,
    sponsorPrincipal: TEST_ACCOUNT_2_STX_ADDRESS,
    feeRecipientPrincipal: TEST_ACCOUNT_2_STX_ADDRESS,
    expiresAt: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
    tiers,
  };
}

function isPost(route: Route) {
  return route.request().method() === 'POST';
}

export async function mockSbtcSponsorshipQuote(
  target: Page | BrowserContext,
  feeSatsByTier?: Record<SbtcSponsorshipFeeTier, number>
) {
  await target.route(sbtcSponsorshipQuoteUrl, route => {
    if (!isPost(route)) return route.fallback();
    return route.fulfill({ json: createSbtcSponsorshipQuoteFixture(feeSatsByTier) });
  });
}

type SbtcSponsorshipSubmitResult =
  | { txid?: string }
  | { status: number; code: string; error?: string; reason?: string };

export async function mockSbtcSponsorshipSubmit(
  target: Page | BrowserContext,
  results: SbtcSponsorshipSubmitResult[] = [{}]
) {
  const queue = [...results];
  await target.route(sbtcSponsorshipSubmitUrl, route => {
    if (!isPost(route)) return route.fallback();
    const result = queue.length > 1 ? queue.shift() : queue[0];
    if (result && 'status' in result) {
      const { status, code, error = code, reason } = result;
      return route.fulfill({ status, json: { error, code, reason } });
    }
    const body: unknown = route.request().postDataJSON();
    const transaction =
      body && typeof body === 'object' && 'transaction' in body ? body.transaction : '';
    return route.fulfill({ json: { txid: result?.txid ?? SBTC_SPONSORSHIP_TXID, transaction } });
  });
}

export async function mockMainnetTestAccountSbtcDepositRequests(page: Page | BrowserContext) {
  await page.route(sbtcEmilyUrl, route =>
    route.fulfill({
      json: {
        deposits: [],
      },
    })
  );

  await mockSbtcSponsorshipQuote(page);
  await mockSbtcSponsorshipSubmit(page);
}

export async function mockSbtcDeposits(
  target: Page | BrowserContext,
  depositsByStatus: Partial<Record<SbtcDepositStatus, SbtcDepositFixture[]>>
) {
  await target.route(sbtcEmilyUrl, route => {
    const status = new URL(route.request().url()).searchParams.get('status');
    const deposits = Object.entries(depositsByStatus).find(([key]) => key === status)?.[1] ?? [];
    return route.fulfill({ json: { deposits } });
  });
}
