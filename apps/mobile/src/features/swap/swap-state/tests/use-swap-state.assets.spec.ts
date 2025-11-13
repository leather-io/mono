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

    expect(result.current.state.baseSwapAsset).toBeNull();
    expect(result.current.state.targetSwapAsset).toBeNull();
    expect(result.current.state.baseAmount).toBe('0');
    expect(result.current.state.pairReconciliation).toMatchObject({
      base: 'pending',
    });
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
      expect(result.current.targetAssetsQuery.status).toBe('success');
    });

    expect(result.current.state.targetSwapAsset).toBeNull();
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
