import { describe, expect, it } from 'vitest';

import { btcAsset, stxAsset } from '@leather.io/constants';
import type { Sip10Asset, SwappableFungibleCryptoAsset } from '@leather.io/models';
import type { AccountSwapAsset } from '@leather.io/services';

import { createSwapAssetsSelector } from './asset-selection';

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

function toSwapAsset(asset: SwappableFungibleCryptoAsset): AccountSwapAsset {
  return { asset, providerAssets: [] };
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
const ststx = createSip10Asset(
  'SP4SZE494VC2YC5JYG7AYFQ44F5Q4PYV7DVMDPBG.ststx-token',
  'ststx',
  'stSTX'
);
const welsh = createSip10Asset(
  'SP3NE50GEXFG9SZGTT51P40X2CKYSZ5CC4ZTZ7A2G.welshcorgicoin-token',
  'welshcorgicoin',
  'WELSH'
);

describe('createSwapAssetsSelector', () => {
  const selectTargets = createSwapAssetsSelector('target');

  it('orders BTC, STX, sBTC and USDCx first, then the swap priority list', () => {
    const assets = [welsh, ststx, usdcx, sbtc, stxAsset, btcAsset].map(toSwapAsset);
    expect(selectTargets(assets).map(swapAsset => swapAsset.asset.symbol)).toEqual([
      'BTC',
      'STX',
      'sBTC',
      'USDCx',
      'stSTX',
      'WELSH',
    ]);
  });

  it('does not pin a token that only copies the sBTC symbol', () => {
    const lookalike = createSip10Asset(
      'SP2KAF9RF86PVX3NEE27DFV1CQX0T4WGR41X3S45C.fake-sbtc',
      'sbtc-token',
      'sBTC'
    );
    const assets = [lookalike, ststx].map(toSwapAsset);
    expect(selectTargets(assets).map(swapAsset => swapAsset.asset.symbol)).toEqual([
      'stSTX',
      'sBTC',
    ]);
  });
});
