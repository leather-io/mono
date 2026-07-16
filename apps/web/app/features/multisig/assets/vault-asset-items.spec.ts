import { describe, expect, it } from 'vitest';

import {
  SBTC_ASSET_ID_MAINNET,
  USDCX_ASSET_ID_MAINNET,
  btcAsset,
  stxAsset,
} from '@leather.io/constants';
import type {
  BaseCryptoAssetBalance,
  FungibleCryptoAsset,
  Money,
  Sip10Asset,
} from '@leather.io/models';
import type { AssetListItem, AssetListItemBalance } from '@leather.io/services';
import { createMoney, getAssetId, serializeAssetId } from '@leather.io/utils';

import { buildVaultAssetItems, filterSendableVaultAssets } from './vault-asset-items';

const usdcxAsset = makeSip10Asset({
  name: 'USDCx',
  symbol: 'USDCx',
  assetId: USDCX_ASSET_ID_MAINNET,
  contractId: USDCX_ASSET_ID_MAINNET.split('::')[0],
});

const sbtcAsset = makeSip10Asset({
  name: 'sBTC',
  symbol: 'sBTC',
  decimals: 8,
  assetId: SBTC_ASSET_ID_MAINNET,
  contractId: SBTC_ASSET_ID_MAINNET.split('::')[0],
});

function makeSip10Asset(overrides: Partial<Sip10Asset>): Sip10Asset {
  return {
    category: 'fungible',
    chain: 'stacks',
    protocol: 'sip10',
    name: 'Token',
    symbol: 'TKN',
    decimals: 6,
    hasMemo: true,
    canTransfer: true,
    assetId: 'SP1234567890.token::token',
    contractId: 'SP1234567890.token',
    imageCanonicalUri: '',
    ...overrides,
  };
}

function makeBaseBalance(money: Money): BaseCryptoAssetBalance {
  return {
    totalBalance: money,
    availableBalance: money,
    inboundBalance: createMoney(0, money.symbol, money.decimals),
    outboundBalance: createMoney(0, money.symbol, money.decimals),
    pendingBalance: createMoney(0, money.symbol, money.decimals),
  };
}

function makeBalance(
  asset: FungibleCryptoAsset,
  cryptoAmount: number,
  fiatAmount: number
): AssetListItemBalance {
  return {
    crypto: makeBaseBalance(createMoney(cryptoAmount, asset.symbol, asset.decimals)),
    quote: makeBaseBalance(createMoney(fiatAmount, 'USD')),
  };
}

function makeItem(asset: FungibleCryptoAsset, balance?: AssetListItemBalance): AssetListItem {
  return { id: serializeAssetId(getAssetId(asset)), asset, balance };
}

describe(buildVaultAssetItems.name, () => {
  it('drops non-pinned assets without a positive balance', () => {
    const junk = makeSip10Asset({
      symbol: 'JUNK',
      assetId: 'SP9.junk::junk',
      contractId: 'SP9.junk',
    });
    const items = buildVaultAssetItems(
      [makeItem(junk), makeItem(junk, makeBalance(junk, 0, 0))],
      'USD'
    );
    expect(items).toHaveLength(0);
  });

  it('keeps held non-pinned assets', () => {
    const meme = makeSip10Asset({
      symbol: 'MEME',
      assetId: 'SP9.meme::meme',
      contractId: 'SP9.meme',
    });
    const items = buildVaultAssetItems([makeItem(meme, makeBalance(meme, 500, 12))], 'USD');
    expect(items).toHaveLength(1);
    expect(items[0].asset.symbol).toBe('MEME');
  });

  it('always includes STX with a zero-filled balance', () => {
    const items = buildVaultAssetItems([makeItem(stxAsset)], 'USD');
    expect(items.map(item => item.asset.symbol)).toEqual(['STX']);
    expect(Number(items[0].crypto.amount)).toBe(0);
    expect(items[0].crypto.symbol).toBe('STX');
    expect(items[0].fiat.symbol).toBe('USD');
  });

  it('pins STX above assets with larger balances', () => {
    const whale = makeSip10Asset({
      symbol: 'WHALE',
      assetId: 'SP9.whale::whale',
      contractId: 'SP9.whale',
    });
    const items = buildVaultAssetItems(
      [makeItem(whale, makeBalance(whale, 1_000_000, 99_999)), makeItem(stxAsset)],
      'USD'
    );
    expect(items.map(item => item.asset.symbol)).toEqual(['STX', 'WHALE']);
  });

  it('renders USDCx and sBTC normally — dropped at zero balance, unpinned when held', () => {
    const whale = makeSip10Asset({
      symbol: 'WHALE',
      assetId: 'SP9.whale::whale',
      contractId: 'SP9.whale',
    });
    const items = buildVaultAssetItems(
      [
        makeItem(usdcxAsset),
        makeItem(sbtcAsset, makeBalance(sbtcAsset, 1_000_000, 100)),
        makeItem(whale, makeBalance(whale, 1_000_000, 99_999)),
        makeItem(stxAsset),
      ],
      'USD'
    );
    expect(items.map(item => item.asset.symbol)).toEqual(['STX', 'WHALE', 'sBTC']);
  });

  it('sorts remaining assets by fiat balance, then symbol', () => {
    const alpha = makeSip10Asset({ symbol: 'AAA', assetId: 'SP9.aaa::aaa', contractId: 'SP9.aaa' });
    const bravo = makeSip10Asset({ symbol: 'BBB', assetId: 'SP9.bbb::bbb', contractId: 'SP9.bbb' });
    const rich = makeSip10Asset({
      symbol: 'RICH',
      assetId: 'SP9.rich::rich',
      contractId: 'SP9.rich',
    });
    const items = buildVaultAssetItems(
      [
        makeItem(bravo, makeBalance(bravo, 100, 1)),
        makeItem(rich, makeBalance(rich, 1, 50)),
        makeItem(alpha, makeBalance(alpha, 10, 1)),
      ],
      'USD'
    );
    expect(items.map(item => item.asset.symbol)).toEqual(['RICH', 'AAA', 'BBB']);
  });

  it('keeps a lone zero-balance BTC row for bitcoin vaults', () => {
    const items = buildVaultAssetItems([makeItem(btcAsset)], 'USD');
    expect(items.map(item => item.asset.symbol)).toEqual(['BTC']);
    expect(Number(items[0].crypto.amount)).toBe(0);
    expect(items[0].crypto.symbol).toBe('BTC');
  });
});

describe(filterSendableVaultAssets.name, () => {
  it('keeps STX even with a zero balance', () => {
    const items = buildVaultAssetItems([makeItem(stxAsset)], 'USD');
    expect(filterSendableVaultAssets(items).map(item => item.asset.symbol)).toEqual(['STX']);
  });

  it('keeps held tokens alongside STX', () => {
    const items = buildVaultAssetItems(
      [makeItem(stxAsset), makeItem(usdcxAsset, makeBalance(usdcxAsset, 500_000_000, 500))],
      'USD'
    );
    expect(filterSendableVaultAssets(items).map(item => item.asset.symbol)).toEqual([
      'STX',
      'USDCx',
    ]);
  });

  it('preserves the pin-sorted order of the input', () => {
    const meme = makeSip10Asset({
      symbol: 'MEME',
      assetId: 'SP9.meme::meme',
      contractId: 'SP9.meme',
    });
    const items = buildVaultAssetItems(
      [
        makeItem(meme, makeBalance(meme, 900, 9000)),
        makeItem(stxAsset),
        makeItem(sbtcAsset, makeBalance(sbtcAsset, 1_000_000, 600)),
      ],
      'USD'
    );
    expect(filterSendableVaultAssets(items).map(item => item.asset.symbol)).toEqual([
      'STX',
      'MEME',
      'sBTC',
    ]);
  });
});
