import BigNumber from 'bignumber.js';

import { btcAsset, stxAsset } from '@leather.io/constants';
import { BaseCryptoAssetBalance, BtcBalance, Money, StxBalance } from '@leather.io/models';

import { PortfolioAsset } from './portfolio-table/portfolio-table';

function createMoney(amount: string, symbol: string, decimals: number): Money {
  return {
    amount: new BigNumber(amount),
    symbol: symbol as any,
    decimals,
  };
}

const btcBalance = createMoney('50000000', 'BTC', 8);
const btcUsdBalance = createMoney('2500000', 'USD', 2);

const stxBalance = createMoney('10000000000', 'STX', 6);
const stxUsdBalance = createMoney('500000', 'USD', 2);

const alexBalance = createMoney('5000000000', 'ALEX', 8);
const alexUsdBalance = createMoney('100000', 'USD', 2);

const miamiBalance = createMoney('1000000000', 'MIA', 6);
const miamiUsdBalance = createMoney('50000', 'USD', 2);

const welshBalance = createMoney('100000000000', 'WELSH', 6);
const welshUsdBalance = createMoney('20000', 'USD', 2);

const zeroBtc = createMoney('0', 'BTC', 8);
const zeroStx = createMoney('0', 'STX', 6);
const zeroUsd = createMoney('0', 'USD', 2);

const btcCryptoBalance: BtcBalance = {
  totalBalance: btcBalance,
  availableBalance: btcBalance,
  pendingBalance: btcBalance,
  inboundBalance: zeroBtc,
  outboundBalance: zeroBtc,
  protectedBalance: zeroBtc,
  dustBalance: zeroBtc,
  unspendableBalance: zeroBtc,
};

const stxCryptoBalance: StxBalance = {
  totalBalance: stxBalance,
  availableBalance: stxBalance,
  pendingBalance: stxBalance,
  inboundBalance: zeroStx,
  outboundBalance: zeroStx,
  availableUnlockedBalance: stxBalance,
  lockedBalance: zeroStx,
  unlockedBalance: stxBalance,
};

function createBaseCryptoBalance(balance: Money, zeroBalance: Money): BaseCryptoAssetBalance {
  return {
    totalBalance: balance,
    availableBalance: balance,
    pendingBalance: balance,
    inboundBalance: zeroBalance,
    outboundBalance: zeroBalance,
  };
}

export const dummyPortfolioAssets: PortfolioAsset[] = [
  {
    asset: btcAsset,
    crypto: btcCryptoBalance,
    quote: createBaseCryptoBalance(btcUsdBalance, zeroUsd),
  },
  {
    asset: stxAsset,
    crypto: stxCryptoBalance,
    quote: createBaseCryptoBalance(stxUsdBalance, zeroUsd),
  },
  {
    asset: {
      chain: 'stacks' as const,
      protocol: 'sip10' as const,
      symbol: 'ALEX',
      category: 'fungible' as const,
      name: 'ALEX Token',
      decimals: 8,
      hasMemo: false,
      contractId: 'SP3K8BC0PPEVCV7NZ6QSRWPQ2JE9E5B6N3PA0KBR9.age000-governance-token',
      assetId: 'SP3K8BC0PPEVCV7NZ6QSRWPQ2JE9E5B6N3PA0KBR9.age000-governance-token',
      canTransfer: true,
      imageCanonicalUri: '',
    },
    crypto: createBaseCryptoBalance(alexBalance, createMoney('0', 'ALEX', 8)),
    quote: createBaseCryptoBalance(alexUsdBalance, zeroUsd),
  },
  {
    asset: {
      chain: 'stacks' as const,
      protocol: 'sip10' as const,
      symbol: 'MIA',
      category: 'fungible' as const,
      name: 'MiamiCoin',
      decimals: 6,
      hasMemo: false,
      contractId: 'SP466FNC0P7JWTNM2R9T199QRZN1MYEDTAR0KP27.miamicoin-token',
      assetId: 'SP466FNC0P7JWTNM2R9T199QRZN1MYEDTAR0KP27.miamicoin-token',
      canTransfer: true,
      imageCanonicalUri: '',
    },
    crypto: createBaseCryptoBalance(miamiBalance, createMoney('0', 'MIA', 6)),
    quote: createBaseCryptoBalance(miamiUsdBalance, zeroUsd),
  },
  {
    asset: {
      chain: 'stacks' as const,
      protocol: 'sip10' as const,
      symbol: 'WELSH',
      category: 'fungible' as const,
      name: 'Welshcorgicoin',
      decimals: 6,
      hasMemo: false,
      contractId: 'SP3NE50GEXFG9SZGTT51P40X2CKYSZ5CC4ZTZ7A2G.welshcorgicoin-token',
      assetId: 'SP3NE50GEXFG9SZGTT51P40X2CKYSZ5CC4ZTZ7A2G.welshcorgicoin-token',
      canTransfer: true,
      imageCanonicalUri: '',
    },
    crypto: createBaseCryptoBalance(welshBalance, createMoney('0', 'WELSH', 6)),
    quote: createBaseCryptoBalance(welshUsdBalance, zeroUsd),
  },
];

export const dummyTotalBalance: Money = createMoney('3170000', 'USD', 2);