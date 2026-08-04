import { act, waitFor } from '@testing-library/react';
import { assert, describe, expect, it } from 'vitest';

import {
  createAccountSwapAsset,
  defaultBtcAsset,
  defaultSbtcAsset,
  defaultStxAsset,
} from './test-utils/fixtures';
import { renderUseSwapState } from './test-utils/render';

describe('initialization', () => {
  it('initializes correctly without assets', () => {
    const result = renderUseSwapState();
    expect(result.current.state).toEqual({
      inputCurrencyMode: 'crypto',
      baseSwapAsset: null,
      targetSwapAsset: null,
      selectingAsset: null,
      assetFlippingAllowed: false,
      isSendingMax: false,
      isInputReady: false,
      pairReconciliation: { base: 'pending', target: 'pending' },
      quoteCurrencyPreference: 'USD',
      quotePolicy: 'best',
      baseAmount: '0',
      secondaryAmount: { status: 'idle', value: null },
      nonceOverride: undefined,
      effectiveNonce: 0,
      slippage: 0.03,
      customFee: null,
      feeTier: 'standard',
    });
  });

  it('initializes correctly with initial base asset', () => {
    const result = renderUseSwapState({
      baseAsset: defaultBtcAsset,
    });

    expect(result.current.state).toMatchObject({
      baseSwapAsset: { asset: defaultBtcAsset, providerAssets: [] },
    });
  });

  it('initializes correctly with both initial assets', () => {
    const result = renderUseSwapState({
      baseAsset: defaultStxAsset,
      targetAsset: defaultBtcAsset,
    });

    expect(result.current.state).toMatchObject({
      baseSwapAsset: { asset: defaultStxAsset, providerAssets: [] },
      targetSwapAsset: { asset: defaultBtcAsset, providerAssets: [] },
    });
  });
});

describe('asset listing', () => {
  it('sorts base assets with BTC, STX, sBTC priority, then by balance descending', async () => {
    const baseSwapAssets = [
      createAccountSwapAsset({
        asset: { protocol: 'sip10', symbol: 'TOKEN1' },
        balance: { quote: 500, crypto: 10 },
      }),
      createAccountSwapAsset({
        asset: defaultStxAsset,
        balance: { quote: 0, crypto: 0 },
      }),
      createAccountSwapAsset({
        asset: { protocol: 'sip10', symbol: 'TOKEN2' },
        balance: { quote: 1000, crypto: 20 },
      }),
      createAccountSwapAsset({
        asset: defaultBtcAsset,
        balance: { quote: 100, crypto: 0.001 },
      }),
      createAccountSwapAsset({
        asset: defaultSbtcAsset,
        balance: { quote: 50, crypto: 0.0005 },
      }),
    ];

    const result = renderUseSwapState({ baseSwapAssets });

    await waitFor(() => {
      expect(result.current.baseAssetsQuery.status).toBe('success');
    });

    const sortedAssets = result.current.baseAssetsQuery.data;
    assert(sortedAssets);
    expect(sortedAssets.map(a => a.asset.symbol)).toEqual([
      'BTC',
      'STX',
      'sBTC',
      'TOKEN2',
      'TOKEN1',
    ]);
  });

  it('filters out assets with zero crypto balance except BTC and STX', async () => {
    const baseSwapAssets = [
      createAccountSwapAsset({
        asset: { protocol: 'sip10', symbol: 'ZERO_TOKEN' },
        balance: { quote: 0, crypto: 0 },
      }),
      createAccountSwapAsset({
        asset: defaultBtcAsset,
        balance: { quote: 0, crypto: 0 },
      }),
      createAccountSwapAsset({
        asset: defaultStxAsset,
        balance: { quote: 0, crypto: 0 },
      }),
      createAccountSwapAsset({
        asset: { protocol: 'sip10', symbol: 'ACTIVE_TOKEN' },
        balance: { quote: 100, crypto: 50 },
      }),
    ];

    const result = renderUseSwapState({ baseSwapAssets });

    await waitFor(() => {
      expect(result.current.baseAssetsQuery.data).toBeDefined();
    });

    const filteredAssets = result.current.baseAssetsQuery.data;
    assert(filteredAssets);
    expect(filteredAssets).toHaveLength(3);
    expect(filteredAssets.map(a => a.asset.symbol)).toEqual(['BTC', 'STX', 'ACTIVE_TOKEN']);
    expect(filteredAssets.find(a => a.asset.symbol === 'ZERO_TOKEN')).toBeUndefined();
  });

  it('sorts target assets with BTC, STX, sBTC priority, then by balance descending', async () => {
    const targetSwapAssets = [
      createAccountSwapAsset({
        asset: { protocol: 'sip10', symbol: 'TOKEN1' },
        balance: { quote: 500, crypto: 10 },
      }),
      createAccountSwapAsset({
        asset: defaultStxAsset,
        balance: { quote: 0, crypto: 0 },
      }),
      createAccountSwapAsset({
        asset: { protocol: 'sip10', symbol: 'TOKEN2' },
        balance: { quote: 1000, crypto: 20 },
      }),
      createAccountSwapAsset({
        asset: defaultBtcAsset,
        balance: { quote: 100, crypto: 0.001 },
      }),
      createAccountSwapAsset({
        asset: defaultSbtcAsset,
        balance: { quote: 50, crypto: 0.0005 },
      }),
    ];

    const result = renderUseSwapState({
      targetSwapAssets,
      baseAsset: defaultBtcAsset,
    });

    await waitFor(() => {
      expect(result.current.targetAssetsQuery.status).toBe('success');
    });

    const sortedAssets = result.current.targetAssetsQuery.data;
    assert(sortedAssets);
    expect(sortedAssets.map(a => a.asset.symbol)).toEqual([
      'BTC',
      'STX',
      'sBTC',
      'TOKEN2',
      'TOKEN1',
    ]);
  });

  it('includes all target assets regardless of balance', async () => {
    const targetSwapAssets = [
      createAccountSwapAsset({
        asset: { protocol: 'sip10', symbol: 'ZERO_TOKEN' },
        balance: { quote: 0, crypto: 0 },
      }),
      createAccountSwapAsset({
        asset: defaultBtcAsset,
        balance: { quote: 0, crypto: 0 },
      }),
      createAccountSwapAsset({
        asset: defaultStxAsset,
        balance: { quote: 0, crypto: 0 },
      }),
      createAccountSwapAsset({
        asset: { protocol: 'sip10', symbol: 'ACTIVE_TOKEN' },
        balance: { quote: 100, crypto: 50 },
      }),
    ];

    const result = renderUseSwapState({
      targetSwapAssets,
      baseAsset: defaultBtcAsset,
    });

    await waitFor(() => {
      expect(result.current.targetAssetsQuery.data).toBeDefined();
    });

    const allAssets = result.current.targetAssetsQuery.data;
    assert(allAssets);
    expect(allAssets).toHaveLength(4);
    expect(allAssets.map(a => a.asset.symbol)).toEqual([
      'BTC',
      'STX',
      'ACTIVE_TOKEN',
      'ZERO_TOKEN',
    ]);
  });
});

describe('asset selection state', () => {
  it('sets state to base when opening base selection', () => {
    const result = renderUseSwapState();

    expect(result.current.state.selectingAsset).toBeNull();
    act(() => result.current.actions.openAssetSelector('base'));
    expect(result.current.state.selectingAsset).toBe('base');
  });

  it('sets state to target when opening target selection', () => {
    const result = renderUseSwapState();

    expect(result.current.state.selectingAsset).toBeNull();
    act(() => result.current.actions.openAssetSelector('target'));
    expect(result.current.state.selectingAsset).toBe('target');
  });

  it('sets state to null when closing selection', () => {
    const result = renderUseSwapState();

    act(() => result.current.actions.openAssetSelector('base'));
    expect(result.current.state.selectingAsset).toBe('base');

    act(() => result.current.actions.closeAssetSelector());
    expect(result.current.state.selectingAsset).toBeNull();
  });
});

describe('base asset selection', () => {
  it('updates state immediately when setting base asset', () => {
    const result = renderUseSwapState();

    const newAsset = createAccountSwapAsset({
      asset: { protocol: 'sip10', symbol: 'TEST_TOKEN' },
      balance: { crypto: 50, quote: 100 },
    });

    act(() => result.current.actions.setBaseSwapAsset(newAsset));
    expect(result.current.state.baseSwapAsset).toEqual(newAsset);
  });

  it('resets amount to zero when setting base asset', () => {
    const result = renderUseSwapState({
      baseAsset: defaultBtcAsset,
    });

    act(() => result.current.actions.setBaseAmount('123.45'));

    const newAsset = createAccountSwapAsset({
      asset: defaultStxAsset,
      balance: { crypto: 50, quote: 100 },
    });

    act(() => result.current.actions.setBaseSwapAsset(newAsset));
    expect(result.current.state.baseAmount).toBe('0');
  });

  it('resets asset selection state after base asset is set', () => {
    const result = renderUseSwapState();

    act(() => result.current.actions.openAssetSelector('base'));
    expect(result.current.state.selectingAsset).toBe('base');

    const newAsset = createAccountSwapAsset({
      asset: defaultStxAsset,
      balance: { crypto: 50, quote: 100 },
    });

    act(() => result.current.actions.setBaseSwapAsset(newAsset));
    expect(result.current.state.selectingAsset).toBeNull();
  });
});

describe('target asset selection', () => {
  it('updates state immediately when setting target asset', () => {
    const result = renderUseSwapState({
      baseAsset: defaultBtcAsset,
    });

    const newTargetAsset = createAccountSwapAsset({
      asset: { protocol: 'sip10', symbol: 'TARGET_TOKEN' },
      balance: { crypto: 25, quote: 200 },
    });

    act(() => result.current.actions.setTargetSwapAsset(newTargetAsset));
    expect(result.current.state.targetSwapAsset).toEqual(newTargetAsset);
  });

  it('resets asset selection state after target asset is set', () => {
    const result = renderUseSwapState({
      baseAsset: defaultBtcAsset,
    });

    act(() => result.current.actions.openAssetSelector('target'));
    expect(result.current.state.selectingAsset).toBe('target');

    const newTargetAsset = createAccountSwapAsset({
      asset: defaultSbtcAsset,
      balance: { crypto: 10, quote: 500 },
    });

    act(() => result.current.actions.setTargetSwapAsset(newTargetAsset));
    expect(result.current.state.selectingAsset).toBeNull();
  });
});

describe('initial placholder base asset reconciliation', () => {
  it('replaces the initial asset with a real asset when data arrives', async () => {
    const realSwapAsset = createAccountSwapAsset({
      asset: defaultBtcAsset,
      balance: { quote: 1000, crypto: 0.5 },
    });

    const result = renderUseSwapState({
      baseAsset: defaultBtcAsset,
      baseSwapAssets: [realSwapAsset],
    });

    expect(result.current.state.baseSwapAsset).toEqual({
      asset: defaultBtcAsset,
      providerAssets: [],
    });
    expect(result.current.state.pairReconciliation.base).toBe('pending');

    await waitFor(() => {
      expect(result.current.state.pairReconciliation.base).toBe('complete');
    });

    expect(result.current.state.baseSwapAsset).toEqual(realSwapAsset);
  });

  it('clears both assets and resets the amount when initial base asset not found in data', async () => {
    const differentAsset = createAccountSwapAsset({
      asset: defaultStxAsset,
      balance: { quote: 500, crypto: 100 },
    });

    const result = renderUseSwapState({
      baseAsset: defaultBtcAsset,
      targetAsset: defaultStxAsset,
      baseSwapAssets: [differentAsset],
    });

    act(() => result.current.actions.setBaseAmount('123.45'));

    expect(result.current.state.baseSwapAsset).toBeTruthy();
    expect(result.current.state.targetSwapAsset).toBeTruthy();
    expect(result.current.state.baseAmount).toBe('123.45');

    await waitFor(() => {
      expect(result.current.baseAssetsQuery.status).toBe('success');
    });
    await waitFor(() => {
      expect(result.current.state.baseSwapAsset).toBeNull();
    });
    expect(result.current.state.targetSwapAsset).toBeNull();
    expect(result.current.state.baseAmount).toBe('0');
    expect(result.current.state.pairReconciliation).toMatchObject({
      base: 'pending',
    });
  });
});

describe('base asset reconciliation on data refresh', () => {
  it('updates the base asset balance when provider data refreshes after reconciliation', async () => {
    const staleAsset = createAccountSwapAsset({
      asset: defaultBtcAsset,
      balance: { quote: 1000, crypto: 0.5 },
    });

    const freshAsset = createAccountSwapAsset({
      asset: defaultBtcAsset,
      balance: { quote: 400, crypto: 0.2 },
    });

    let providerAssets = [staleAsset];
    const result = renderUseSwapState({
      baseAsset: defaultBtcAsset,
      getBaseSwapAssets: () => Promise.resolve(providerAssets),
    });

    await waitFor(() => {
      expect(result.current.state.pairReconciliation.base).toBe('complete');
    });
    expect(result.current.state.baseSwapAsset).toEqual(staleAsset);

    providerAssets = [freshAsset];
    await act(async () => {
      await result.current.baseAssetsQuery.refetch();
    });

    await waitFor(() => {
      expect(result.current.state.baseSwapAsset).toEqual(freshAsset);
    });
  });

  it('keeps the selected pair when the base asset disappears from refreshed data', async () => {
    const btcAsset = createAccountSwapAsset({
      asset: defaultBtcAsset,
      balance: { quote: 1000, crypto: 0.5 },
    });

    let providerAssets = [btcAsset];
    const result = renderUseSwapState({
      baseAsset: defaultBtcAsset,
      getBaseSwapAssets: () => Promise.resolve(providerAssets),
    });

    await waitFor(() => {
      expect(result.current.state.pairReconciliation.base).toBe('complete');
    });

    providerAssets = [];
    await act(async () => {
      await result.current.baseAssetsQuery.refetch();
    });

    expect(result.current.state.baseSwapAsset).toEqual(btcAsset);
    expect(result.current.state.pairReconciliation.base).toBe('complete');
  });
});

describe('initial placholder target asset reconciliation', () => {
  it('replaces the initial asset with a real asset when data arrives', async () => {
    const realBaseAsset = createAccountSwapAsset({
      asset: defaultBtcAsset,
      balance: { quote: 1000, crypto: 0.5 },
    });

    const realTargetAsset = createAccountSwapAsset({
      asset: defaultStxAsset,
      balance: { quote: 500, crypto: 100 },
    });

    const result = renderUseSwapState({
      baseAsset: defaultBtcAsset,
      targetAsset: defaultStxAsset,
      baseSwapAssets: [realBaseAsset],
      targetSwapAssets: [realTargetAsset],
    });

    expect(result.current.state.targetSwapAsset).toEqual({
      asset: defaultStxAsset,
      providerAssets: [],
    });
    expect(result.current.state.pairReconciliation.target).toBe('pending');

    await waitFor(() => {
      expect(result.current.state.pairReconciliation.target).toBe('complete');
    });

    expect(result.current.state.targetSwapAsset).toEqual(realTargetAsset);
  });

  it('clears target asset when initial target asset not found in data', async () => {
    const realBaseAsset = createAccountSwapAsset({
      asset: defaultBtcAsset,
      balance: { quote: 1000, crypto: 0.5 },
    });

    const differentTargetAsset = createAccountSwapAsset({
      asset: defaultSbtcAsset,
      balance: { quote: 200, crypto: 0.002 },
    });

    const result = renderUseSwapState({
      baseAsset: defaultBtcAsset,
      targetAsset: defaultStxAsset,
      baseSwapAssets: [realBaseAsset],
      targetSwapAssets: [differentTargetAsset],
    });

    expect(result.current.state.targetSwapAsset).toBeTruthy();
    expect(result.current.state.baseSwapAsset).toBeTruthy();

    await waitFor(() => {
      expect(result.current.state.targetSwapAsset).toBeNull();
    });

    expect(result.current.state.baseSwapAsset).toEqual(realBaseAsset);
    expect(result.current.state.pairReconciliation.target).toBe('pending');
  });

  it('reconciles target asset when base asset changes', async () => {
    const btcAsset = createAccountSwapAsset({
      asset: defaultBtcAsset,
      balance: { quote: 1000, crypto: 0.5 },
    });

    const stxAsset = createAccountSwapAsset({
      asset: defaultStxAsset,
      balance: { quote: 500, crypto: 100 },
    });

    const sbtcAsset = createAccountSwapAsset({
      asset: defaultSbtcAsset,
      balance: { quote: 200, crypto: 0.002 },
    });

    const result = renderUseSwapState({
      baseAsset: defaultStxAsset,
      targetAsset: defaultSbtcAsset,
      baseSwapAssets: [btcAsset, stxAsset],
      targetSwapAssets: [sbtcAsset],
    });

    await waitFor(() => {
      expect(result.current.state.pairReconciliation.base).toBe('complete');
      expect(result.current.state.pairReconciliation.target).toBe('complete');
    });

    expect(result.current.state.targetSwapAsset).toEqual(sbtcAsset);

    act(() => result.current.actions.setBaseSwapAsset(btcAsset));

    expect(result.current.state.pairReconciliation.target).toBe('pending');

    await waitFor(() => {
      expect(result.current.state.pairReconciliation.target).toBe('complete');
    });

    expect(result.current.state.targetSwapAsset).toEqual(sbtcAsset);
  });
});

describe('flipping base and target assets', () => {
  it('flips base and target positions', () => {
    const btcAsset = createAccountSwapAsset({
      asset: defaultBtcAsset,
      balance: { quote: 1000, crypto: 0.5 },
    });

    const stxAsset = createAccountSwapAsset({
      asset: defaultStxAsset,
      balance: { quote: 500, crypto: 100 },
    });

    const result = renderUseSwapState();

    act(() => {
      result.current.actions.setBaseSwapAsset(btcAsset);
      result.current.actions.setTargetSwapAsset(stxAsset);
    });

    expect(result.current.state.baseSwapAsset).toEqual(btcAsset);
    expect(result.current.state.targetSwapAsset).toEqual(stxAsset);

    act(() => result.current.actions.flipAssets());

    expect(result.current.state.baseSwapAsset).toEqual(stxAsset);
    expect(result.current.state.targetSwapAsset).toEqual(btcAsset);
  });

  it('only flips if both assets are set', () => {
    const btcAsset = createAccountSwapAsset({
      asset: defaultBtcAsset,
      balance: { quote: 1000, crypto: 0.5 },
    });

    const result = renderUseSwapState();

    act(() => result.current.actions.setBaseSwapAsset(btcAsset));
    expect(result.current.state.baseSwapAsset).toEqual(btcAsset);
    expect(result.current.state.targetSwapAsset).toBeNull();

    act(() => result.current.actions.flipAssets());
    expect(result.current.state.baseSwapAsset).toEqual(btcAsset);
    expect(result.current.state.targetSwapAsset).toBeNull();
  });

  it('resets base amount to 0 when flipping', () => {
    const btcAsset = createAccountSwapAsset({
      asset: defaultBtcAsset,
      balance: { quote: 1000, crypto: 0.5 },
    });

    const stxAsset = createAccountSwapAsset({
      asset: defaultStxAsset,
      balance: { quote: 500, crypto: 100 },
    });

    const result = renderUseSwapState();

    act(() => {
      result.current.actions.setBaseSwapAsset(btcAsset);
      result.current.actions.setTargetSwapAsset(stxAsset);
      result.current.actions.setBaseAmount('123.45');
    });
    expect(result.current.state.baseAmount).toBe('123.45');
    expect(result.current.state.isSendingMax).toBe(false);

    act(() => result.current.actions.flipAssets());
    expect(result.current.state.baseAmount).toBe('0');
  });

  it('indicates asset flipping is allowed', () => {
    const btcAsset = createAccountSwapAsset({
      asset: defaultBtcAsset,
      balance: { quote: 1000, crypto: 0.5 },
    });

    const stxAsset = createAccountSwapAsset({
      asset: defaultStxAsset,
      balance: { quote: 500, crypto: 100 },
    });

    const result = renderUseSwapState();

    expect(result.current.state.assetFlippingAllowed).toBe(false);

    act(() => result.current.actions.setBaseSwapAsset(btcAsset));
    expect(result.current.state.assetFlippingAllowed).toBe(false);

    act(() => result.current.actions.setTargetSwapAsset(stxAsset));
    expect(result.current.state.assetFlippingAllowed).toBe(true);

    act(() => result.current.actions.clearAssetSelection());
    expect(result.current.state.assetFlippingAllowed).toBe(false);
  });

  it('marks both assets for re-reconciliation', async () => {
    const btcAsset = createAccountSwapAsset({
      asset: defaultBtcAsset,
      balance: { quote: 1000, crypto: 0.5 },
    });

    const stxAsset = createAccountSwapAsset({
      asset: defaultStxAsset,
      balance: { quote: 500, crypto: 100 },
    });

    const result = renderUseSwapState({
      baseSwapAssets: [btcAsset, stxAsset],
      targetSwapAssets: [btcAsset, stxAsset],
    });

    act(() => {
      result.current.actions.setBaseSwapAsset(btcAsset);
      result.current.actions.setTargetSwapAsset(stxAsset);
    });
    await waitFor(() => {
      expect(result.current.state.pairReconciliation.base).toBe('complete');
      expect(result.current.state.pairReconciliation.target).toBe('complete');
    });

    act(() => result.current.actions.flipAssets());
    expect(result.current.state.pairReconciliation.base).toBe('pending');
    expect(result.current.state.pairReconciliation.target).toBe('pending');
  });

  it('flips automatically when selecting current target as new base', () => {
    const btcAsset = createAccountSwapAsset({
      asset: defaultBtcAsset,
      balance: { quote: 1000, crypto: 0.5 },
    });

    const stxAsset = createAccountSwapAsset({
      asset: defaultStxAsset,
      balance: { quote: 500, crypto: 100 },
    });

    const result = renderUseSwapState({
      baseAsset: defaultBtcAsset,
      targetAsset: defaultStxAsset,
    });

    act(() => {
      result.current.actions.setBaseSwapAsset(btcAsset);
      result.current.actions.setTargetSwapAsset(stxAsset);
      result.current.actions.setBaseAmount('123.45');
    });

    expect(result.current.state.baseSwapAsset).toEqual(btcAsset);
    expect(result.current.state.targetSwapAsset).toEqual(stxAsset);
    expect(result.current.state.baseAmount).toBe('123.45');

    act(() => result.current.actions.setBaseSwapAsset(stxAsset));

    expect(result.current.state.baseSwapAsset).toEqual(stxAsset);
    expect(result.current.state.targetSwapAsset).toEqual(btcAsset);
    expect(result.current.state.baseAmount).toBe('0');
    expect(result.current.state.pairReconciliation.base).toBe('pending');
    expect(result.current.state.pairReconciliation.target).toBe('pending');
    expect(result.current.state.selectingAsset).toBeNull();
  });
});

describe('disabled pairs', () => {
  describe('base asset filtering', () => {
    it('filters base asset when it has wildcard target disabled', async () => {
      const baseSwapAssets = [
        createAccountSwapAsset({ asset: defaultBtcAsset }),
        createAccountSwapAsset({ asset: defaultStxAsset }),
      ];

      const result = renderUseSwapState({
        baseSwapAssets,
        disabledPairs: [{ base: { protocol: 'nativeBtc', id: 'BTC' }, target: '*' }],
      });

      await waitFor(() => {
        expect(result.current.baseAssetsQuery.status).toBe('success');
      });

      const filteredAssets = result.current.baseAssetsQuery.data;
      assert(filteredAssets);
      expect(filteredAssets).toHaveLength(1);
      expect(filteredAssets[0].asset.symbol).toBe('STX');
    });

    it('keeps base asset when only specific target is disabled', async () => {
      const baseSwapAssets = [
        createAccountSwapAsset({ asset: defaultBtcAsset }),
        createAccountSwapAsset({ asset: defaultStxAsset }),
      ];

      const result = renderUseSwapState({
        baseSwapAssets,
        disabledPairs: [
          {
            base: { protocol: 'nativeBtc', id: 'BTC' },
            target: { protocol: 'nativeStx', id: 'STX' },
          },
        ],
      });

      await waitFor(() => {
        expect(result.current.baseAssetsQuery.status).toBe('success');
      });

      const filteredAssets = result.current.baseAssetsQuery.data;
      assert(filteredAssets);
      expect(filteredAssets).toHaveLength(2);
      expect(filteredAssets.map(a => a.asset.symbol)).toContain('BTC');
      expect(filteredAssets.map(a => a.asset.symbol)).toContain('STX');
    });

    it('filters multiple base assets with wildcard rules', async () => {
      const baseSwapAssets = [
        createAccountSwapAsset({ asset: defaultBtcAsset }),
        createAccountSwapAsset({ asset: defaultStxAsset }),
        createAccountSwapAsset({ asset: defaultSbtcAsset, balance: { crypto: 1, quote: 100 } }),
      ];

      const result = renderUseSwapState({
        baseSwapAssets,
        disabledPairs: [
          { base: { protocol: 'nativeBtc', id: 'BTC' }, target: '*' },
          { base: { protocol: 'nativeStx', id: 'STX' }, target: '*' },
        ],
      });

      await waitFor(() => {
        expect(result.current.baseAssetsQuery.status).toBe('success');
      });

      const filteredAssets = result.current.baseAssetsQuery.data;
      assert(filteredAssets);
      const symbols = filteredAssets.map(a => a.asset.symbol);
      expect(symbols).not.toContain('BTC');
      expect(symbols).not.toContain('STX');
    });
  });

  describe('target asset filtering', () => {
    it('filters target when pair is explicitly disabled', async () => {
      const targetSwapAssets = [
        createAccountSwapAsset({ asset: defaultStxAsset }),
        createAccountSwapAsset({ asset: defaultSbtcAsset }),
      ];

      const result = renderUseSwapState({
        baseAsset: defaultBtcAsset,
        targetSwapAssets,
        disabledPairs: [
          {
            base: { protocol: 'nativeBtc', id: 'BTC' },
            target: { protocol: 'nativeStx', id: 'STX' },
          },
        ],
      });

      await waitFor(() => {
        expect(result.current.targetAssetsQuery.status).toBe('success');
      });

      const filteredAssets = result.current.targetAssetsQuery.data;
      assert(filteredAssets);
      expect(filteredAssets.map(a => a.asset.symbol)).not.toContain('STX');
    });

    it('filters target when wildcard base rule matches', async () => {
      const targetSwapAssets = [
        createAccountSwapAsset({ asset: defaultStxAsset }),
        createAccountSwapAsset({ asset: defaultSbtcAsset }),
      ];

      const result = renderUseSwapState({
        baseAsset: defaultBtcAsset,
        targetSwapAssets,
        disabledPairs: [{ base: '*', target: { protocol: 'nativeStx', id: 'STX' } }],
      });

      await waitFor(() => {
        expect(result.current.targetAssetsQuery.status).toBe('success');
      });

      const filteredAssets = result.current.targetAssetsQuery.data;
      assert(filteredAssets);
      expect(filteredAssets.map(a => a.asset.symbol)).not.toContain('STX');
    });

    it('allows target when disabled rule applies to different base', async () => {
      const targetSwapAssets = [
        createAccountSwapAsset({ asset: defaultStxAsset }),
        createAccountSwapAsset({ asset: defaultSbtcAsset }),
      ];

      const result = renderUseSwapState({
        baseAsset: defaultBtcAsset,
        targetSwapAssets,
        disabledPairs: [
          { base: { protocol: 'nativeStx', id: 'STX' }, target: { protocol: 'sip10', id: 'sBTC' } },
        ],
      });

      await waitFor(() => {
        expect(result.current.targetAssetsQuery.status).toBe('success');
      });

      const filteredAssets = result.current.targetAssetsQuery.data;
      assert(filteredAssets);
      expect(filteredAssets.map(a => a.asset.symbol)).toContain('sBTC');
    });

    it('filters multiple targets for same base', async () => {
      const targetSwapAssets = [
        createAccountSwapAsset({ asset: defaultStxAsset }),
        createAccountSwapAsset({ asset: defaultSbtcAsset }),
      ];

      const result = renderUseSwapState({
        baseAsset: defaultBtcAsset,
        targetSwapAssets,
        disabledPairs: [
          {
            base: { protocol: 'nativeBtc', id: 'BTC' },
            target: { protocol: 'nativeStx', id: 'STX' },
          },
          { base: { protocol: 'nativeBtc', id: 'BTC' }, target: { protocol: 'sip10', id: 'sBTC' } },
        ],
      });

      await waitFor(() => {
        expect(result.current.targetAssetsQuery.status).toBe('success');
      });

      const filteredAssets = result.current.targetAssetsQuery.data;
      assert(filteredAssets);
      const symbols = filteredAssets.map(a => a.asset.symbol);
      expect(symbols).not.toContain('STX');
      expect(symbols).not.toContain('sBTC');
    });
  });

  describe('reconciliation with disabled pairs', () => {
    it('clears prepopulated base asset when entirely disabled', async () => {
      const baseSwapAssets = [
        createAccountSwapAsset({ asset: defaultBtcAsset }),
        createAccountSwapAsset({ asset: defaultStxAsset }),
      ];

      const result = renderUseSwapState({
        baseAsset: defaultBtcAsset,
        baseSwapAssets,
        disabledPairs: [{ base: { protocol: 'nativeBtc', id: 'BTC' }, target: '*' }],
      });

      expect(result.current.state.baseSwapAsset).toBeTruthy();

      await waitFor(() => {
        expect(result.current.baseAssetsQuery.status).toBe('success');
      });

      await waitFor(() => {
        expect(result.current.state.baseSwapAsset).toBeNull();
      });
    });

    it('clears prepopulated target when pair is disabled', async () => {
      const baseSwapAssets = [
        createAccountSwapAsset({ asset: defaultBtcAsset }),
        createAccountSwapAsset({ asset: defaultStxAsset }),
      ];
      const targetSwapAssets = [
        createAccountSwapAsset({ asset: defaultStxAsset }),
        createAccountSwapAsset({ asset: defaultSbtcAsset }),
      ];

      const result = renderUseSwapState({
        baseAsset: defaultBtcAsset,
        targetAsset: defaultStxAsset,
        baseSwapAssets,
        targetSwapAssets,
        disabledPairs: [
          {
            base: { protocol: 'nativeBtc', id: 'BTC' },
            target: { protocol: 'nativeStx', id: 'STX' },
          },
        ],
      });

      expect(result.current.state.baseSwapAsset).toBeTruthy();
      expect(result.current.state.targetSwapAsset).toBeTruthy();

      await waitFor(() => {
        expect(result.current.targetAssetsQuery.status).toBe('success');
      });

      await waitFor(() => {
        expect(result.current.state.targetSwapAsset).toBeNull();
      });

      expect(result.current.state.baseSwapAsset).toBeTruthy();
    });

    it('clears both assets when base is disabled', async () => {
      const baseSwapAssets = [
        createAccountSwapAsset({ asset: defaultBtcAsset }),
        createAccountSwapAsset({ asset: defaultStxAsset }),
      ];
      const targetSwapAssets = [createAccountSwapAsset({ asset: defaultStxAsset })];

      const result = renderUseSwapState({
        baseAsset: defaultBtcAsset,
        targetAsset: defaultStxAsset,
        baseSwapAssets,
        targetSwapAssets,
        disabledPairs: [{ base: { protocol: 'nativeBtc', id: 'BTC' }, target: '*' }],
      });

      expect(result.current.state.baseSwapAsset).toBeTruthy();
      expect(result.current.state.targetSwapAsset).toBeTruthy();

      await waitFor(() => {
        expect(result.current.baseAssetsQuery.status).toBe('success');
      });

      await waitFor(() => {
        expect(result.current.state.baseSwapAsset).toBeNull();
      });

      expect(result.current.state.targetSwapAsset).toBeNull();
    });

    it('clears target when base change creates disabled pair', async () => {
      const btcAsset = createAccountSwapAsset({ asset: defaultBtcAsset });
      const stxAsset = createAccountSwapAsset({ asset: defaultStxAsset });
      const sbtcAsset = createAccountSwapAsset({ asset: defaultSbtcAsset });

      const result = renderUseSwapState({
        baseSwapAssets: [btcAsset, stxAsset],
        targetSwapAssets: [stxAsset, sbtcAsset],
        disabledPairs: [
          {
            base: { protocol: 'nativeBtc', id: 'BTC' },
            target: { protocol: 'nativeStx', id: 'STX' },
          },
        ],
      });

      await waitFor(() => {
        expect(result.current.baseAssetsQuery.status).toBe('success');
      });

      act(() => {
        result.current.actions.setBaseSwapAsset(stxAsset);
        result.current.actions.setTargetSwapAsset(stxAsset);
      });

      expect(result.current.state.baseSwapAsset).toEqual(stxAsset);
      expect(result.current.state.targetSwapAsset).toEqual(stxAsset);

      act(() => {
        result.current.actions.setBaseSwapAsset(btcAsset);
      });

      await waitFor(() => {
        expect(result.current.state.targetSwapAsset).toBeNull();
      });

      expect(result.current.state.baseSwapAsset).toEqual(btcAsset);
      expect(result.current.state.pairReconciliation.target).toBe('pending');
    });
  });

  describe('asset flipping with disabled pairs', () => {
    it('disallows flip when flipped pair would be disabled', async () => {
      const btcAsset = createAccountSwapAsset({ asset: defaultBtcAsset });
      const stxAsset = createAccountSwapAsset({ asset: defaultStxAsset });

      const result = renderUseSwapState({
        baseSwapAssets: [btcAsset, stxAsset],
        targetSwapAssets: [btcAsset, stxAsset],
        disabledPairs: [
          {
            base: { protocol: 'nativeBtc', id: 'BTC' },
            target: { protocol: 'nativeStx', id: 'STX' },
          },
        ],
      });

      await waitFor(() => {
        expect(result.current.baseAssetsQuery.status).toBe('success');
      });

      act(() => {
        result.current.actions.setBaseSwapAsset(stxAsset);
        result.current.actions.setTargetSwapAsset(btcAsset);
      });

      expect(result.current.state.baseSwapAsset?.asset.symbol).toBe('STX');
      expect(result.current.state.targetSwapAsset?.asset.symbol).toBe('BTC');
      expect(result.current.state.assetFlippingAllowed).toBe(false);
    });

    it('allows flip when flipped pair is not disabled', async () => {
      const btcAsset = createAccountSwapAsset({ asset: defaultBtcAsset });
      const stxAsset = createAccountSwapAsset({ asset: defaultStxAsset });
      const sbtcAsset = createAccountSwapAsset({
        asset: defaultSbtcAsset,
        balance: { crypto: 1, quote: 100 },
      });

      const result = renderUseSwapState({
        baseSwapAssets: [btcAsset, stxAsset, sbtcAsset],
        targetSwapAssets: [btcAsset, stxAsset, sbtcAsset],
        disabledPairs: [
          {
            base: { protocol: 'nativeBtc', id: 'BTC' },
            target: { protocol: 'nativeStx', id: 'STX' },
          },
        ],
      });

      await waitFor(() => {
        expect(result.current.baseAssetsQuery.status).toBe('success');
      });

      act(() => {
        result.current.actions.setBaseSwapAsset(stxAsset);
        result.current.actions.setTargetSwapAsset(sbtcAsset);
      });

      expect(result.current.state.baseSwapAsset?.asset.symbol).toBe('STX');
      expect(result.current.state.targetSwapAsset?.asset.symbol).toBe('sBTC');
      expect(result.current.state.assetFlippingAllowed).toBe(true);
    });

    it('flip action is no-op when flipped pair is disabled', async () => {
      const btcAsset = createAccountSwapAsset({ asset: defaultBtcAsset });
      const stxAsset = createAccountSwapAsset({ asset: defaultStxAsset });

      const result = renderUseSwapState({
        baseSwapAssets: [btcAsset, stxAsset],
        targetSwapAssets: [btcAsset, stxAsset],
        disabledPairs: [
          {
            base: { protocol: 'nativeBtc', id: 'BTC' },
            target: { protocol: 'nativeStx', id: 'STX' },
          },
        ],
      });

      await waitFor(() => {
        expect(result.current.baseAssetsQuery.status).toBe('success');
      });

      act(() => {
        result.current.actions.setBaseSwapAsset(stxAsset);
        result.current.actions.setTargetSwapAsset(btcAsset);
      });

      expect(result.current.state.baseSwapAsset?.asset.symbol).toBe('STX');
      expect(result.current.state.targetSwapAsset?.asset.symbol).toBe('BTC');

      act(() => {
        result.current.actions.flipAssets();
      });

      expect(result.current.state.baseSwapAsset?.asset.symbol).toBe('STX');
      expect(result.current.state.targetSwapAsset?.asset.symbol).toBe('BTC');
    });
  });

  // TODO: Need to amend renderUseSwapState helper with `rerender` to be able to test this.
  describe('runtime disabled pairs changes', () => {
    it.todo('clears target when new rule disables current pair');
    it.todo('keeps pair when new rule does not affect current selection');
  });

  describe('edge cases', () => {
    it('undefined disabledPairs applies no filtering', async () => {
      const baseSwapAssets = [
        createAccountSwapAsset({ asset: defaultBtcAsset }),
        createAccountSwapAsset({ asset: defaultStxAsset }),
      ];

      const result = renderUseSwapState({ baseSwapAssets });

      await waitFor(() => {
        expect(result.current.baseAssetsQuery.status).toBe('success');
      });

      const filteredAssets = result.current.baseAssetsQuery.data;
      assert(filteredAssets);
      expect(filteredAssets).toHaveLength(2);
    });

    it('empty rules array applies no filtering', async () => {
      const baseSwapAssets = [
        createAccountSwapAsset({ asset: defaultBtcAsset }),
        createAccountSwapAsset({ asset: defaultStxAsset }),
      ];

      const result = renderUseSwapState({
        baseSwapAssets,
        disabledPairs: [],
      });

      await waitFor(() => {
        expect(result.current.baseAssetsQuery.status).toBe('success');
      });

      const filteredAssets = result.current.baseAssetsQuery.data;
      assert(filteredAssets);
      expect(filteredAssets).toHaveLength(2);
    });

    it('double wildcard rule disables all swaps', async () => {
      const baseSwapAssets = [
        createAccountSwapAsset({ asset: defaultBtcAsset }),
        createAccountSwapAsset({ asset: defaultStxAsset }),
      ];

      const result = renderUseSwapState({
        baseSwapAssets,
        disabledPairs: [{ base: '*', target: '*' }],
      });

      await waitFor(() => {
        expect(result.current.baseAssetsQuery.status).toBe('success');
      });

      const filteredAssets = result.current.baseAssetsQuery.data;
      assert(filteredAssets);
      expect(filteredAssets).toHaveLength(0);
    });

    it('rule for non-existent asset has no effect', async () => {
      const baseSwapAssets = [
        createAccountSwapAsset({ asset: defaultBtcAsset }),
        createAccountSwapAsset({ asset: defaultStxAsset }),
      ];

      const result = renderUseSwapState({
        baseSwapAssets,
        disabledPairs: [{ base: { protocol: 'sip10', id: 'NONEXISTENT' }, target: '*' }],
      });

      await waitFor(() => {
        expect(result.current.baseAssetsQuery.status).toBe('success');
      });

      const filteredAssets = result.current.baseAssetsQuery.data;
      assert(filteredAssets);
      expect(filteredAssets).toHaveLength(2);
    });
  });

  describe('missing bitcoin dependencies', () => {
    it('filters BTC from base assets without any explicit rules', async () => {
      const baseSwapAssets = [
        createAccountSwapAsset({ asset: defaultBtcAsset }),
        createAccountSwapAsset({ asset: defaultStxAsset }),
        createAccountSwapAsset({ asset: defaultSbtcAsset, balance: { crypto: 1, quote: 100 } }),
      ];

      const result = renderUseSwapState({
        baseSwapAssets,
        dependencies: { bitcoin: undefined },
      });

      await waitFor(() => {
        expect(result.current.baseAssetsQuery.status).toBe('success');
      });

      const filteredAssets = result.current.baseAssetsQuery.data;
      assert(filteredAssets);
      const symbols = filteredAssets.map(a => a.asset.symbol);
      expect(symbols).not.toContain('BTC');
      expect(symbols).toContain('STX');
      expect(symbols).toContain('sBTC');
    });

    it('filters BTC from target assets without any explicit rules', async () => {
      const targetSwapAssets = [
        createAccountSwapAsset({ asset: defaultBtcAsset }),
        createAccountSwapAsset({ asset: defaultSbtcAsset }),
      ];

      const result = renderUseSwapState({
        baseAsset: defaultStxAsset,
        targetSwapAssets,
        dependencies: { bitcoin: undefined },
      });

      await waitFor(() => {
        expect(result.current.targetAssetsQuery.status).toBe('success');
      });

      const filteredAssets = result.current.targetAssetsQuery.data;
      assert(filteredAssets);
      const symbols = filteredAssets.map(a => a.asset.symbol);
      expect(symbols).not.toContain('BTC');
      expect(symbols).toContain('sBTC');
    });

    it('combines injected rules with explicit disabled pairs', async () => {
      const baseSwapAssets = [
        createAccountSwapAsset({ asset: defaultBtcAsset }),
        createAccountSwapAsset({ asset: defaultStxAsset }),
        createAccountSwapAsset({ asset: defaultSbtcAsset, balance: { crypto: 1, quote: 100 } }),
      ];

      const result = renderUseSwapState({
        baseSwapAssets,
        dependencies: { bitcoin: undefined },
        disabledPairs: [{ base: { protocol: 'nativeStx', id: 'STX' }, target: '*' }],
      });

      await waitFor(() => {
        expect(result.current.baseAssetsQuery.status).toBe('success');
      });

      const filteredAssets = result.current.baseAssetsQuery.data;
      assert(filteredAssets);
      const symbols = filteredAssets.map(a => a.asset.symbol);
      expect(symbols).not.toContain('BTC');
      expect(symbols).not.toContain('STX');
      expect(symbols).toContain('sBTC');
    });
  });
});
