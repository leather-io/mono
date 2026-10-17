import BigNumber from 'bignumber.js';

import type { Money } from '@leather.io/models';
import { createMoney } from '@leather.io/utils';

const sbtcSymbol = 'sBTC';
export const sbtcDecimals = 8;
const stxDecimals = 6;
const usdDecimals = 2;
const microStxPerStx = 1_000_000;
const mockBtcUsdPrice = 100_000;

export const mockAccount = {
  name: 'Account 1',
  address: 'SP2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKNRV9EJ7',
  nextNonce: 12,
  sbtcBalanceSats: 250_000,
  stxBalanceMicro: 0,
};

export const mockRecipient = 'SP3FBR2AGK5H9QBDH3EEN6DF8EK8JY7RX8QJ5SVTE';
const mockSbtcContractId = 'SM3VDXK3WZZSA84XXFKAFAF15NNZX32CTSG82JFQ4.sbtc-token';

interface MockSponsorshipQuote {
  quoteId: string;
  feeRecipientPrincipal: string;
  satsPerStx: string;
  minFeeSats: number;
  maxFeeSats: number;
  ttlMinutes: number;
}

export const mockQuote: MockSponsorshipQuote = {
  quoteId: 'eyJ2ZXJzaW9uIjoxLCJjaGFpbklkIjoxLCJzYXRzUGVyU3R4IjoiNzIwIiwibWluRmVlU2F0cyI6MTAsIm1h…',
  feeRecipientPrincipal: 'SP3TP7XMD6XYV79SHK4HYY94EGQZZ7SB5DH3RB9AC',
  satsPerStx: '720',
  minFeeSats: 10,
  maxFeeSats: 50_000,
  ttlMinutes: 3,
};

export const feeTiers = ['low', 'standard', 'high'] as const;
export type FeeTier = (typeof feeTiers)[number];

export const feeTierLabels: Record<FeeTier, string> = {
  low: 'Low',
  standard: 'Standard',
  high: 'High',
};

export const feeTierTimes: Record<FeeTier, string> = {
  low: '~30 min',
  standard: '~10 min',
  high: '~2 min',
};

export const sbtcTransferStxFeeMicro: Record<FeeTier, number> = {
  low: 120_000,
  standard: 180_000,
  high: 360_000,
};

export const contractCallBundleStxFeeMicro: Record<FeeTier, number> = {
  low: 260_000,
  standard: 400_000,
  high: 800_000,
};

function getSponsoredFeeSats(stxFeeMicro: number, quote: MockSponsorshipQuote): number {
  const feeSats = new BigNumber(stxFeeMicro)
    .div(microStxPerStx)
    .times(quote.satsPerStx)
    .integerValue(BigNumber.ROUND_CEIL);
  return BigNumber.min(BigNumber.max(feeSats, quote.minFeeSats), quote.maxFeeSats).toNumber();
}

export function getFeeSatsByTier(
  stxFeeMicroByTier: Record<FeeTier, number>,
  quote: MockSponsorshipQuote
): Record<FeeTier, number> {
  return {
    low: getSponsoredFeeSats(stxFeeMicroByTier.low, quote),
    standard: getSponsoredFeeSats(stxFeeMicroByTier.standard, quote),
    high: getSponsoredFeeSats(stxFeeMicroByTier.high, quote),
  };
}

export function sats(amount: number | BigNumber): Money {
  return createMoney(amount, sbtcSymbol, sbtcDecimals);
}

export function microStx(amount: number): Money {
  return createMoney(amount, 'STX', stxDecimals);
}

export function satsToUsd(amountSats: number | BigNumber): Money {
  const cents = new BigNumber(amountSats)
    .shiftedBy(-sbtcDecimals)
    .times(mockBtcUsdPrice)
    .shiftedBy(usdDecimals)
    .integerValue(BigNumber.ROUND_HALF_UP);
  return createMoney(cents, 'USD', usdDecimals);
}

export function formatStxFee(stxFeeMicro: number) {
  return `${new BigNumber(stxFeeMicro).shiftedBy(-stxDecimals).toFixed()} STX`;
}

export const mockContractCall = {
  origin: 'https://app.example.com',
  contractAddress: 'SP2C2YFP12AJZB4MABJBAJ55XECVS7E4PMMZ89YZR',
  contractName: 'amm-pool-v2',
  functionName: 'swap-x-for-y',
  args: [
    { name: 'token-x', type: 'trait', value: mockSbtcContractId },
    {
      name: 'token-y',
      type: 'trait',
      value: 'SP2C2YFP12AJZB4MABJBAJ55XECVS7E4PMMZ89YZR.token-wstx',
    },
    { name: 'dx', type: 'uint', value: 'u100000' },
    { name: 'min-dy', type: 'uint', value: 'u158200000' },
  ],
  amountSats: 100_000,
};

export const mockTxids = {
  sbtcTransfer: '9b709768122e6c62a37b087106cc9c23280ed6242b565484b6cc4e6a43ae1155',
  feePayment: '4f1d6c0a9e2b7c3d5e8f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d',
  contractCall: 'c3a1e5d7b9f2048a6c1e3f5d7b9a2c4e6f8a0b2d4f6a8c0e2b4d6f8a0c2e4b6d',
};
