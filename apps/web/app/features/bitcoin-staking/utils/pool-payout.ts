import { BitcoinStakingPool } from '~/data/bitcoin-staking-data';

export type PoolPayoutMode = 'sbtc' | 'sbtc-or-btc' | 'btc-only';

type PoolPayoutFacts = Pick<BitcoinStakingPool, 'supportsBtcPayout' | 'operatorBtcPayout'>;

export const customPoolPayoutMode: PoolPayoutMode = 'sbtc-or-btc';

export function getPoolPayoutMode(pool: PoolPayoutFacts): PoolPayoutMode {
  if (pool.operatorBtcPayout) return 'btc-only';
  return pool.supportsBtcPayout ? 'sbtc-or-btc' : 'sbtc';
}

export function isBtcPayoutRequired(payoutMode: PoolPayoutMode): boolean {
  return payoutMode === 'btc-only';
}

export function canPayoutInBtc(payoutMode: PoolPayoutMode): boolean {
  return payoutMode !== 'sbtc';
}

const rewardsTokenLabels: Record<PoolPayoutMode, string> = {
  sbtc: 'sBTC',
  'sbtc-or-btc': 'sBTC / BTC',
  'btc-only': 'BTC',
};

export function getRewardsTokenLabel(payoutMode: PoolPayoutMode): string {
  return rewardsTokenLabels[payoutMode];
}

export function getRewardsTokenSymbol(payoutMode: PoolPayoutMode): 'BTC' | 'sBTC' {
  return payoutMode === 'btc-only' ? 'BTC' : 'sBTC';
}
