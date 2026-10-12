import { describe, expect, it } from 'vitest';

import { btcAsset, stxAsset } from '@leather.io/constants';
import type { FungibleCryptoAsset, Sip10Asset } from '@leather.io/models';

import { isPinnedAsset, sortByPinnedAssetOrder } from './pinned-asset-order';

function createSip10Asset(contractId: string, tokenName: string, symbol: string): Sip10Asset {
  return {
    assetId: `${contractId}::${tokenName}`,
    canTransfer: true,
    category: 'fungible',
    chain: 'stacks',
    contractId,
    decimals: 6,
    hasMemo: true,
    imageCanonicalUri: '',
    name: symbol,
    protocol: 'sip10',
    symbol,
  };
}

const sbtc = createSip10Asset(
  'SM3VDXK3WZZSA84XXFKAFAF15NNZX32CTSG82JFQ4.sbtc-token',
  'sbtc-token',
  'sBTC'
);
const usdcx = createSip10Asset(
  'SP120SBRBQJ00MCWS7TM5R8WJNTTKD5K0HFRC2CNE.usdcx',
  'usdcx-token',
  'USDCx'
);
const welsh = createSip10Asset(
  'SP3NE50GEXFG9SZGTT51P40X2CKYSZ5CC4ZTZ7A2G.welshcorgicoin-token',
  'welshcorgicoin',
  'WELSH'
);
const alex = createSip10Asset(
  'SP102V8P0F7JX67ARQ77WEA3D3CFB5XW39REDT0AM.token-alex',
  'alex',
  'ALEX'
);

function symbols(items: { asset: FungibleCryptoAsset }[]) {
  return items.map(item => item.asset.symbol);
}

describe('sortByPinnedAssetOrder', () => {
  it('puts BTC, STX, sBTC and USDCx first, in that order, whatever their input position', () => {
    const items = [welsh, usdcx, alex, sbtc, stxAsset, btcAsset].map(asset => ({ asset }));
    expect(symbols(sortByPinnedAssetOrder(items))).toEqual([
      'BTC',
      'STX',
      'sBTC',
      'USDCx',
      'WELSH',
      'ALEX',
    ]);
  });

  it('keeps the incoming order, such as fiat value, for everything after the pinned assets', () => {
    const items = [alex, sbtc, welsh].map(asset => ({ asset }));
    expect(symbols(sortByPinnedAssetOrder(items))).toEqual(['sBTC', 'ALEX', 'WELSH']);
  });

  it('pins sBTC above USDCx even when USDCx is worth more', () => {
    const items = [
      { asset: usdcx, fiat: 10_000 },
      { asset: sbtc, fiat: 1 },
    ];
    expect(symbols(sortByPinnedAssetOrder(items))).toEqual(['sBTC', 'USDCx']);
  });

  it('pins the testnet sBTC and USDCx contracts', () => {
    const testnetSbtc = createSip10Asset(
      'SNGWPN3XDAQE673MXYXF81016M50NHF5X5PWWM70.sbtc-token',
      'sbtc-token',
      'sBTC'
    );
    const testnetUsdcx = createSip10Asset(
      'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.usdcx',
      'usdcx-token',
      'USDCx'
    );
    const items = [welsh, testnetUsdcx, testnetSbtc].map(asset => ({ asset }));
    expect(symbols(sortByPinnedAssetOrder(items))).toEqual(['sBTC', 'USDCx', 'WELSH']);
  });

  it('does not mutate the input', () => {
    const items = [welsh, sbtc].map(asset => ({ asset }));
    sortByPinnedAssetOrder(items);
    expect(symbols(items)).toEqual(['WELSH', 'sBTC']);
  });
});

describe('isPinnedAsset', () => {
  it('matches sBTC by contract, not by symbol', () => {
    const lookalike = createSip10Asset(
      'SP2KAF9RF86PVX3NEE27DFV1CQX0T4WGR41X3S45C.fake-sbtc',
      'sbtc-token',
      'sBTC'
    );
    expect(isPinnedAsset(sbtc)).toBe(true);
    expect(isPinnedAsset(lookalike)).toBe(false);
  });

  it('matches the sBTC contract whatever the token name in the asset id', () => {
    expect(isPinnedAsset({ ...sbtc, assetId: `${sbtc.contractId}::sbtc` })).toBe(true);
  });

  it('does not pin other tokens', () => {
    expect(isPinnedAsset(welsh)).toBe(false);
  });
});
