import { describe, expect, it } from 'vitest';

import { Sip10AggregateBalance } from '@leather.io/services';
import { createMoney } from '@leather.io/utils';

import { sortSip10Balances } from './sort-sip10-balances';

const mockBalances: Sip10AggregateBalance['sip10s'] = [
  {
    asset: {
      assetId: 'SP4SZE494VC2YC5JYG7AYFQ44F5Q4PYV7DVMDPBG.ststx-token::ststx',
      canTransfer: true,
      category: 'fungible',
      chain: 'stacks',
      contractId: 'SP4SZE494VC2YC5JYG7AYFQ44F5Q4PYV7DVMDPBG.ststx-token',
      decimals: 6,
      hasMemo: true,
      imageCanonicalUri: 'https://app.stackingdao.com/ststx-logo.png',
      name: 'Stacked STX Token',
      protocol: 'sip10',
      symbol: 'stSTX',
    },
    crypto: {
      availableBalance: createMoney(2000000000000000000, 'stSTX'),
      inboundBalance: createMoney(1000000000000000000, 'stSTX'),
      outboundBalance: createMoney(500000000000000000, 'stSTX'),
      pendingBalance: createMoney(200000000000000000, 'stSTX'),
      totalBalance: createMoney(3700000000000000000, 'stSTX'),
    },
    fiat: {
      availableBalance: createMoney(0, 'USD'),
      inboundBalance: createMoney(0, 'USD'),
      outboundBalance: createMoney(0, 'USD'),
      pendingBalance: createMoney(0, 'USD'),
      totalBalance: createMoney(0, 'USD'),
    },
  },
  {
    asset: {
      assetId: 'SM3VDXK3WZZSA84XXFKAFAF15NNZX32CTSG82JFQ4.sbtc-token::sbtc-token',
      canTransfer: true,
      category: 'fungible',
      chain: 'stacks',
      contractId: 'SM3VDXK3WZZSA84XXFKAFAF15NNZX32CTSG82JFQ4.sbtc-token',
      decimals: 8,
      hasMemo: true,
      imageCanonicalUri:
        'https://ipfs.io/ipfs/bafkreiffe46h5voimvulxm2s4ddszdm4uli4rwcvx34cgzz3xkfcc2hiwi',
      name: 'sBTC',
      protocol: 'sip10',
      symbol: 'sBTC',
    },
    crypto: {
      availableBalance: createMoney(1, 'sBTC'),
      inboundBalance: createMoney(1, 'sBTC'),
      outboundBalance: createMoney(1, 'sBTC'),
      pendingBalance: createMoney(1, 'sBTC'),
      totalBalance: createMoney(1, 'sBTC'),
    },
    fiat: {
      availableBalance: createMoney(5, 'USD'),
      inboundBalance: createMoney(0, 'USD'),
      outboundBalance: createMoney(0, 'USD'),
      pendingBalance: createMoney(0, 'USD'),
      totalBalance: createMoney(1, 'USD'),
    },
  },
  {
    asset: {
      assetId: 'SPRSRMPJX76HQKCRMWDHB41F55P855KHNJ374M5W.aluxlobs::AluxLobs',
      canTransfer: true,
      category: 'fungible',
      chain: 'stacks',
      contractId: 'SPRSRMPJX76HQKCRMWDHB41F55P855KHNJ374M5W.aluxlobs',
      decimals: 5,
      hasMemo: true,
      imageCanonicalUri:
        'https://rose-useful-vicuna-13.mypinata.cloud/ipfs/QmW5eYQTYvDpiEB1jHfQdYjaPrpfQLoG3WwGvWUXPevNe9/',
      name: 'AluxLobs',
      protocol: 'sip10',
      symbol: 'ALUX',
    },
    crypto: {
      availableBalance: createMoney(100000000, 'ALUX'),
      inboundBalance: createMoney(50000000, 'ALUX'),
      outboundBalance: createMoney(20000000, 'ALUX'),
      pendingBalance: createMoney(10000000, 'ALUX'),
      totalBalance: createMoney(180000000, 'ALUX'),
    },
    fiat: {
      availableBalance: createMoney(0, 'USD'),
      inboundBalance: createMoney(0, 'USD'),
      outboundBalance: createMoney(0, 'USD'),
      pendingBalance: createMoney(0, 'USD'),
      totalBalance: createMoney(0, 'USD'),
    },
  },
  {
    asset: {
      assetId: 'SP102V8P0F7JX67ARQ77WEA3D3CFB5XW39REDT0AM.token-alex::alex',
      canTransfer: true,
      category: 'fungible',
      chain: 'stacks',
      contractId: 'SP102V8P0F7JX67ARQ77WEA3D3CFB5XW39REDT0AM.token-alex',
      decimals: 8,
      hasMemo: true,
      imageCanonicalUri: 'https://cdn.alexlab.co/logos/ALEX_Token.png',
      name: 'ALEX Token',
      protocol: 'sip10',
      symbol: 'ALEX',
    },
    crypto: {
      availableBalance: createMoney(100000000, 'ALEX'),
      inboundBalance: createMoney(50000000, 'ALEX'),
      outboundBalance: createMoney(20000000, 'ALEX'),
      pendingBalance: createMoney(10000000, 'ALEX'),
      totalBalance: createMoney(180000000, 'ALEX'),
    },
    fiat: {
      availableBalance: createMoney(3, 'USD'),
      inboundBalance: createMoney(0, 'USD'),
      outboundBalance: createMoney(0, 'USD'),
      pendingBalance: createMoney(0, 'USD'),
      totalBalance: createMoney(3, 'USD'),
    },
  },
  {
    asset: {
      assetId: 'SP2C2YFP12AJZB4MABJBAJ55XECVS7E4PMMZ89YZR.usda-token::usda',
      canTransfer: true,
      category: 'fungible',
      chain: 'stacks',
      contractId: 'SP2C2YFP12AJZB4MABJBAJ55XECVS7E4PMMZ89YZR.usda-token',
      decimals: 6,
      hasMemo: true,
      imageCanonicalUri: '',
      name: 'USDA',
      protocol: 'sip10',
      symbol: 'USDA',
    },
    crypto: {
      availableBalance: createMoney(100000000, 'USDA'),
      inboundBalance: createMoney(50000000, 'USDA'),
      outboundBalance: createMoney(20000000, 'USDA'),
      pendingBalance: createMoney(10000000, 'USDA'),
      totalBalance: createMoney(180000000, 'USDA'),
    },
    fiat: {
      availableBalance: createMoney(0, 'USD'),
      inboundBalance: createMoney(0, 'USD'),
      outboundBalance: createMoney(0, 'USD'),
      pendingBalance: createMoney(0, 'USD'),
      totalBalance: createMoney(0, 'USD'),
    },
  },
  {
    asset: {
      assetId: 'SM26NBC8SFHNW4P1Y4DFH27974P56WN86C92HPEHH.token-lqstx::lqstx',
      canTransfer: true,
      category: 'fungible',
      chain: 'stacks',
      contractId: 'SM26NBC8SFHNW4P1Y4DFH27974P56WN86C92HPEHH.token-lqstx',
      decimals: 6,
      hasMemo: true,
      imageCanonicalUri: 'https://token-images.alexlab.co/token-wlqstx',
      name: 'LiSTX',
      protocol: 'sip10',
      symbol: 'LiSTX',
    },
    crypto: {
      availableBalance: createMoney(100000000, 'LiSTX'),
      inboundBalance: createMoney(50000000, 'LiSTX'),
      outboundBalance: createMoney(20000000, 'LiSTX'),
      pendingBalance: createMoney(10000000, 'LiSTX'),
      totalBalance: createMoney(180000000, 'LiSTX'),
    },
    fiat: {
      availableBalance: createMoney(4, 'USD'),
      inboundBalance: createMoney(0, 'USD'),
      outboundBalance: createMoney(0, 'USD'),
      pendingBalance: createMoney(0, 'USD'),
      totalBalance: createMoney(4, 'USD'),
    },
  },
  {
    asset: {
      assetId: 'SP1AY6K3PQV5MRT6R4S671NWW2FRVPKM0BR162CT6.leo-token::leo',
      canTransfer: true,
      category: 'fungible',
      chain: 'stacks',
      contractId: 'SP1AY6K3PQV5MRT6R4S671NWW2FRVPKM0BR162CT6.leo-token',
      decimals: 6,
      hasMemo: true,
      imageCanonicalUri: 'https://token-meta.s3.eu-central-1.amazonaws.com/icon.png',
      name: 'Leo',
      protocol: 'sip10',
      symbol: 'LEO',
    },
    crypto: {
      availableBalance: createMoney(100000000, 'LEO'),
      inboundBalance: createMoney(50000000, 'LEO'),
      outboundBalance: createMoney(20000000, 'LEO'),
      pendingBalance: createMoney(10000000, 'LEO'),
      totalBalance: createMoney(180000000, 'LEO'),
    },
    fiat: {
      availableBalance: createMoney(0, 'USD'),
      inboundBalance: createMoney(0, 'USD'),
      outboundBalance: createMoney(0, 'USD'),
      pendingBalance: createMoney(0, 'USD'),
      totalBalance: createMoney(0, 'USD'),
    },
  },
  {
    asset: {
      assetId: 'SP2XD7417HGPRTREMKF748VNEQPDRR0RMANB7X1NK.token-susdt::bridged-usdt',
      canTransfer: true,
      category: 'fungible',
      chain: 'stacks',
      contractId: 'SP2XD7417HGPRTREMKF748VNEQPDRR0RMANB7X1NK.token-susdt',
      decimals: 8,
      hasMemo: true,
      imageCanonicalUri: 'https://token-images.alexlab.co/token-susdt',
      name: 'aUSD',
      protocol: 'sip10',
      symbol: 'aUSD',
    },
    crypto: {
      availableBalance: createMoney(100000000, 'aUSD'),
      inboundBalance: createMoney(50000000, 'aUSD'),
      outboundBalance: createMoney(20000000, 'aUSD'),
      pendingBalance: createMoney(10000000, 'aUSD'),
      totalBalance: createMoney(180000000, 'aUSD'),
    },
    fiat: {
      availableBalance: createMoney(0, 'USD'),
      inboundBalance: createMoney(0, 'USD'),
      outboundBalance: createMoney(0, 'USD'),
      pendingBalance: createMoney(0, 'USD'),
      totalBalance: createMoney(0, 'USD'),
    },
  },
  {
    asset: {
      assetId: 'SP3NE50GEXFG9SZGTT51P40X2CKYSZ5CC4ZTZ7A2G.welshcorgicoin-token::welshcorgicoin',
      canTransfer: true,
      category: 'fungible',
      chain: 'stacks',
      contractId: 'SP3NE50GEXFG9SZGTT51P40X2CKYSZ5CC4ZTZ7A2G.welshcorgicoin-token',
      decimals: 6,
      hasMemo: true,
      imageCanonicalUri:
        'https://raw.githubusercontent.com/Welshcorgicoin/Welshcorgicoin/main/logos/welsh_tokenlogo.png',
      name: 'Welshcorgicoin',
      protocol: 'sip10',
      symbol: 'WELSH',
    },
    crypto: {
      availableBalance: createMoney(100000000, 'WELSH'),
      inboundBalance: createMoney(50000000, 'WELSH'),
      outboundBalance: createMoney(20000000, 'WELSH'),
      pendingBalance: createMoney(10000000, 'WELSH'),
      totalBalance: createMoney(180000000, 'WELSH'),
    },
    fiat: {
      availableBalance: createMoney(5, 'USD'),
      inboundBalance: createMoney(5, 'USD'),
      outboundBalance: createMoney(5, 'USD'),
      pendingBalance: createMoney(5, 'USD'),
      totalBalance: createMoney(5, 'USD'),
    },
  },
  {
    asset: {
      assetId: 'SP2XD7417HGPRTREMKF748VNEQPDRR0RMANB7X1NK.token-abtc::bridged-btc',
      canTransfer: true,
      category: 'fungible',
      chain: 'stacks',
      contractId: 'SP2XD7417HGPRTREMKF748VNEQPDRR0RMANB7X1NK.token-abtc',
      decimals: 8,
      hasMemo: true,
      imageCanonicalUri: 'https://token-images.alexlab.co/token-abtc',
      name: 'aBTC',
      protocol: 'sip10',
      symbol: 'aBTC',
    },
    crypto: {
      availableBalance: createMoney(100000000, 'aBTC'),
      inboundBalance: createMoney(50000000, 'aBTC'),
      outboundBalance: createMoney(20000000, 'aBTC'),
      pendingBalance: createMoney(10000000, 'aBTC'),
      totalBalance: createMoney(180000000, 'aBTC'),
    },
    fiat: {
      availableBalance: createMoney(0, 'USD'),
      inboundBalance: createMoney(0, 'USD'),
      outboundBalance: createMoney(0, 'USD'),
      pendingBalance: createMoney(0, 'USD'),
      totalBalance: createMoney(0, 'USD'),
    },
  },
  {
    asset: {
      assetId: 'SP2KAF9RF86PVX3NEE27DFV1CQX0T4WGR41X3S45C.btc-monkeys-bananas::BANANA',
      canTransfer: true,
      category: 'fungible',
      chain: 'stacks',
      contractId: 'SP2KAF9RF86PVX3NEE27DFV1CQX0T4WGR41X3S45C.btc-monkeys-bananas',
      decimals: 6,
      hasMemo: true,
      imageCanonicalUri: '',
      name: 'BANANA',
      protocol: 'sip10',
      symbol: 'BAN',
    },
    crypto: {
      availableBalance: createMoney(100000000, 'BANANA'),
      inboundBalance: createMoney(50000000, 'BANANA'),
      outboundBalance: createMoney(20000000, 'BANANA'),
      pendingBalance: createMoney(10000000, 'BANANA'),
      totalBalance: createMoney(180000000, 'BANANA'),
    },
    fiat: {
      availableBalance: createMoney(3, 'USD'),
      inboundBalance: createMoney(0, 'USD'),
      outboundBalance: createMoney(0, 'USD'),
      pendingBalance: createMoney(0, 'USD'),
      totalBalance: createMoney(3, 'USD'),
    },
  },
];

/** Expected order
 * sBTC - $1
 * WELSH - $5
 * LiSTX - $4
 * ALEX - $3
 * BANANA - $3
 * stSTX - $0 - crypto total balance 3700000000000000000, 'stSTX'
 * ALUX - $0
 * aBTC - $0
 * aUSD - $0
 * LEO - $0
 * USDA - $0
 */
describe('sortSip10Balances', () => {
  it('should sort sBTC first regardless of balance', () => {
    const sorted = [...mockBalances].sort(sortSip10Balances);
    expect(sorted[0]?.asset.symbol).toBe('sBTC');
  });

  it('should next sort by fiat total balance when symbols are different', () => {
    const sorted = [...mockBalances].sort(sortSip10Balances);
    expect(sorted[1]?.asset.symbol).toBe('WELSH');
    expect(sorted[2]?.asset.symbol).toBe('LiSTX');
    expect(sorted[3]?.asset.symbol).toBe('ALEX');
    expect(sorted[4]?.asset.symbol).toBe('BAN');
  });

  it('should then sort by crypto total balance when fiat balances are equal', () => {
    const sorted = [...mockBalances].sort(sortSip10Balances);
    expect(sorted[5]?.asset.symbol).toBe('stSTX');
    expect(sorted[6]?.asset.symbol).toBe('aBTC');
  });

  it('should then sort alphabetically by symbol', () => {
    const sorted = [...mockBalances].sort(sortSip10Balances);
    expect(sorted[6]?.asset.symbol).toBe('aBTC');
    expect(sorted[7]?.asset.symbol).toBe('ALUX');
    expect(sorted[8]?.asset.symbol).toBe('aUSD');
    expect(sorted[9]?.asset.symbol).toBe('LEO');
    expect(sorted[10]?.asset.symbol).toBe('USDA');
  });
});
