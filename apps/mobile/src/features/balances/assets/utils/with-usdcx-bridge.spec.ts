import { describe, expect, it } from 'vitest';

import { SBTC_ASSET_ID_MAINNET, USDCX_ASSET_ID_MAINNET } from '@leather.io/constants';
import { Sip10Balance } from '@leather.io/services';
import { createMoney } from '@leather.io/utils';

import { isUsdcxBridgeItem, shouldShowUsdcxBridge, withUsdcxBridge } from './with-usdcx-bridge';

function createSip10Balance(assetId: string, symbol: string, amount = 1): Sip10Balance {
  const [contractId = assetId] = assetId.split('::');
  const crypto = createMoney(amount, symbol);
  const quote = createMoney(1, 'USD');
  return {
    asset: {
      assetId,
      canTransfer: true,
      category: 'fungible',
      chain: 'stacks',
      contractId,
      decimals: 0,
      hasMemo: true,
      imageCanonicalUri: '',
      name: symbol,
      protocol: 'sip10',
      symbol,
    },
    crypto: {
      availableBalance: crypto,
      inboundBalance: crypto,
      outboundBalance: crypto,
      pendingBalance: crypto,
      totalBalance: crypto,
    },
    quote: {
      availableBalance: quote,
      inboundBalance: quote,
      outboundBalance: quote,
      pendingBalance: quote,
      totalBalance: quote,
    },
  };
}

const sbtc = createSip10Balance(SBTC_ASSET_ID_MAINNET, 'sBTC');
const usdcx = createSip10Balance(USDCX_ASSET_ID_MAINNET, 'USDCx');
const welsh = createSip10Balance(
  'SP3NE50GEXFG9SZGTT51P40X2CKYSZ5CC4ZTZ7A2G.welshcorgicoin-token::welshcorgicoin',
  'WELSH'
);
const alex = createSip10Balance(
  'SP102V8P0F7JX67ARQ77WEA3D3CFB5XW39REDT0AM.token-alex::alex',
  'ALEX'
);

function labels(items: ReturnType<typeof withUsdcxBridge>) {
  return items.map(item => (isUsdcxBridgeItem(item) ? 'bridge' : item.asset.symbol));
}

describe('withUsdcxBridge', () => {
  it('puts the bridge row right after sBTC when the account holds no USDCx', () => {
    expect(labels(withUsdcxBridge([sbtc, welsh, alex], USDCX_ASSET_ID_MAINNET, true))).toEqual([
      'sBTC',
      'bridge',
      'WELSH',
      'ALEX',
    ]);
  });

  it('puts the bridge row first when no pinned token is held', () => {
    expect(labels(withUsdcxBridge([welsh, alex], USDCX_ASSET_ID_MAINNET, true))).toEqual([
      'bridge',
      'WELSH',
      'ALEX',
    ]);
  });

  it('adds no bridge row when the account holds USDCx', () => {
    expect(labels(withUsdcxBridge([sbtc, usdcx, welsh], USDCX_ASSET_ID_MAINNET, true))).toEqual([
      'sBTC',
      'USDCx',
      'WELSH',
    ]);
  });

  it('adds no bridge row when USDCx is switched off', () => {
    expect(labels(withUsdcxBridge([sbtc, welsh], USDCX_ASSET_ID_MAINNET, false))).toEqual([
      'sBTC',
      'WELSH',
    ]);
  });

  it('places the bridge row above a token that only copies the sBTC symbol', () => {
    const lookalike = createSip10Balance(
      'SP2KAF9RF86PVX3NEE27DFV1CQX0T4WGR41X3S45C.fake-sbtc::sbtc-token',
      'sBTC'
    );
    expect(labels(withUsdcxBridge([lookalike, welsh], USDCX_ASSET_ID_MAINNET, true))).toEqual([
      'bridge',
      'sBTC',
      'WELSH',
    ]);
  });
});

describe('shouldShowUsdcxBridge', () => {
  const emptyUsdcx = createSip10Balance(USDCX_ASSET_ID_MAINNET, 'USDCx', 0);

  it('shows the bridge when the USDCx balance is zero', () => {
    expect(
      shouldShowUsdcxBridge({ usdcxBalance: emptyUsdcx, isMainnet: true, isVisible: true })
    ).toBe(true);
  });

  it('never shows the bridge to an account that holds USDCx, even if the list filtered it out', () => {
    expect(
      withUsdcxBridge(
        [sbtc, welsh],
        USDCX_ASSET_ID_MAINNET,
        shouldShowUsdcxBridge({
          usdcxBalance: usdcx,
          isMainnet: true,
          isVisible: true,
        })
      )
    ).toEqual([sbtc, welsh]);
  });

  it('does not show the bridge while the USDCx balance is unknown', () => {
    expect(
      shouldShowUsdcxBridge({ usdcxBalance: undefined, isMainnet: true, isVisible: true })
    ).toBe(false);
  });

  it('does not show the bridge on testnet', () => {
    expect(
      shouldShowUsdcxBridge({ usdcxBalance: emptyUsdcx, isMainnet: false, isVisible: true })
    ).toBe(false);
  });

  it('does not show the bridge when USDCx is switched off', () => {
    expect(
      shouldShowUsdcxBridge({ usdcxBalance: emptyUsdcx, isMainnet: true, isVisible: false })
    ).toBe(false);
  });
});
