import { describe, expect, it } from 'vitest';

import {
  SBTC_ASSET_ID_MAINNET,
  SBTC_ASSET_ID_TESTNET,
  USDCX_ASSET_ID_MAINNET,
  USDCX_ASSET_ID_TESTNET,
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

import { buildVaultAssetItems } from './vault-asset-items';

const usdcxAsset = makeSip10Asset({
  name: 'USDCx',
  symbol: 'USDCx',
  assetId: USDCX_ASSET_ID_MAINNET,
  contractId: USDCX_ASSET_ID_MAINNET.split('::')[0],
});

const testnetUsdcxAsset = makeSip10Asset({
  name: 'USDCx',
  symbol: 'USDCx',
  assetId: USDCX_ASSET_ID_TESTNET,
  contractId: USDCX_ASSET_ID_TESTNET.split('::')[0],
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
      'USD',
      'mainnet'
    );
    expect(items).toHaveLength(0);
  });

  it('keeps held non-pinned assets', () => {
    const meme = makeSip10Asset({
      symbol: 'MEME',
      assetId: 'SP9.meme::meme',
      contractId: 'SP9.meme',
    });
    const items = buildVaultAssetItems(
      [makeItem(meme, makeBalance(meme, 500, 12))],
      'USD',
      'mainnet'
    );
    expect(items).toHaveLength(1);
    expect(items[0].asset.symbol).toBe('MEME');
  });

  it('always includes STX, USDCx and sBTC with zero-filled balances', () => {
    const items = buildVaultAssetItems(
      [makeItem(stxAsset), makeItem(sbtcAsset), makeItem(usdcxAsset)],
      'USD',
      'mainnet'
    );
    expect(items.map(item => item.asset.symbol)).toEqual(['STX', 'USDCx', 'sBTC']);
    expect(items.map(item => Number(item.crypto.amount))).toEqual([0, 0, 0]);
    expect(items[0].crypto.symbol).toBe('STX');
    expect(items[0].fiat.symbol).toBe('USD');
    expect(items[2].crypto.decimals).toBe(8);
  });

  it('pins STX, USDCx and sBTC above assets with larger balances', () => {
    const whale = makeSip10Asset({
      symbol: 'WHALE',
      assetId: 'SP9.whale::whale',
      contractId: 'SP9.whale',
    });
    const items = buildVaultAssetItems(
      [
        makeItem(whale, makeBalance(whale, 1_000_000, 99_999)),
        makeItem(usdcxAsset, makeBalance(usdcxAsset, 5, 5)),
        makeItem(stxAsset),
        makeItem(sbtcAsset),
      ],
      'USD',
      'mainnet'
    );
    expect(items.map(item => item.asset.symbol)).toEqual(['STX', 'USDCx', 'sBTC', 'WHALE']);
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
      'USD',
      'mainnet'
    );
    expect(items.map(item => item.asset.symbol)).toEqual(['RICH', 'AAA', 'BBB']);
  });

  it('drops the other network variant of a pinned token when not held', () => {
    const items = buildVaultAssetItems(
      [makeItem(usdcxAsset, makeBalance(usdcxAsset, 100, 100)), makeItem(testnetUsdcxAsset)],
      'USD',
      'mainnet'
    );
    expect(items.map(item => item.asset.assetId)).toEqual([USDCX_ASSET_ID_MAINNET]);
  });

  it('pins the testnet variants on testnet vaults', () => {
    const items = buildVaultAssetItems(
      [makeItem(usdcxAsset), makeItem(testnetUsdcxAsset)],
      'USD',
      'testnet'
    );
    expect(items.map(item => item.asset.assetId)).toEqual([USDCX_ASSET_ID_TESTNET]);
  });

  it('matches testnet sBTC by contract id when the constant has no asset name suffix', () => {
    const testnetSbtc = makeSip10Asset({
      name: 'sBTC',
      symbol: 'sBTC',
      decimals: 8,
      assetId: `${SBTC_ASSET_ID_TESTNET}::sbtc-token`,
      contractId: SBTC_ASSET_ID_TESTNET,
    });
    const items = buildVaultAssetItems([makeItem(testnetSbtc)], 'USD', 'testnet');
    expect(items).toHaveLength(1);
    expect(items[0].asset.symbol).toBe('sBTC');
  });

  it('keeps a lone zero-balance BTC row for bitcoin vaults', () => {
    const items = buildVaultAssetItems([makeItem(btcAsset)], 'USD', 'mainnet');
    expect(items.map(item => item.asset.symbol)).toEqual(['BTC']);
    expect(Number(items[0].crypto.amount)).toBe(0);
    expect(items[0].crypto.symbol).toBe('BTC');
  });
});
