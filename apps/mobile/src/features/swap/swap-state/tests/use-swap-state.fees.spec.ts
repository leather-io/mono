import { act, waitFor } from '@testing-library/react';
import { assert, describe, expect, it } from 'vitest';

import {
  createAccountSwapAsset,
  createSwapQuote,
  defaultBtcAsset,
  defaultStxAsset,
} from './test-utils/fixtures';
import { renderUseSwapState } from './test-utils/render';

describe('internal fee state management', () => {
  it('setFeeTier updates feeTier', () => {
    const result = renderUseSwapState();

    act(() => result.current.actions.setFeeTier('high'));
    expect(result.current.state.feeTier).toBe('high');
    expect(result.current.state.customFee).toBeNull();
  });

  it('setCustomFee updates customFee value', () => {
    const result = renderUseSwapState();

    expect(result.current.state.customFee).toBeNull();

    act(() => result.current.actions.setCustomFee(15000));
    expect(result.current.state.customFee).toBe(15000);
  });

  it('setting tier after custom fee clears customFee', () => {
    const result = renderUseSwapState();

    act(() => result.current.actions.setCustomFee(20000));
    expect(result.current.state.customFee).toBe(20000);

    act(() => result.current.actions.setFeeTier('low'));
    expect(result.current.state.feeTier).toBe('low');
    expect(result.current.state.customFee).toBeNull();

    act(() => result.current.actions.setCustomFee(10000));
    expect(result.current.state.customFee).toBe(10000);

    act(() => result.current.actions.setFeeTier('high'));
    expect(result.current.state.feeTier).toBe('high');
    expect(result.current.state.customFee).toBeNull();
  });
});

describe('fee query lifecycle', () => {
  it('networkFeeQuery is disabled when no quote exists', async () => {
    const result = renderUseSwapState({
      baseAsset: defaultBtcAsset,
      targetAsset: defaultStxAsset,
      swapQuotes: [],
    });

    act(() => {
      result.current.actions.setBaseAmount('0.1');
    });

    await waitFor(() => {
      expect(result.current.quoteQuery.status).toBe('success');
    });

    expect(result.current.quoteQuery.data?.quotes).toEqual([]);
    expect(result.current.networkFeeQuery.fetchStatus).toBe('idle');
  });

  it('networkFeeQuery is enabled when valid quote and amount exist', async () => {
    const result = renderUseSwapState({
      baseAsset: defaultBtcAsset,
      targetAsset: defaultStxAsset,
      swapQuotes: [createSwapQuote({ baseAmount: 0.1 })],
    });

    act(() => {
      result.current.actions.setBaseAmount('0.1');
    });

    await waitFor(() => {
      expect(result.current.quoteQuery.status).toBe('success');
      expect(result.current.networkFeeQuery.status).toBe('success');
    });

    expect(result.current.quoteQuery.data?.selected).toBeDefined();
    expect(result.current.networkFeeQuery.data).toBeDefined();
  });

  it('networkFeeQuery refetches when dependencies change', async () => {
    const result = renderUseSwapState({
      baseAsset: defaultBtcAsset,
      targetAsset: defaultStxAsset,
      swapQuotes: [createSwapQuote({ baseAmount: 0.1 })],
    });

    act(() => result.current.actions.setBaseAmount('0.1'));
    await waitFor(() => {
      expect(result.current.networkFeeQuery.status).toBe('success');
    });

    const firstData = result.current.networkFeeQuery.data;

    act(() => result.current.actions.setBaseAmount('0.2'));
    await waitFor(() => {
      expect(result.current.networkFeeQuery.data).not.toBe(firstData);
    });
  });

  it('networkFeeQuery remains disabled when quote baseAmount misaligned with state', async () => {
    const result = renderUseSwapState({
      baseAsset: defaultBtcAsset,
      targetAsset: defaultStxAsset,
      swapQuotes: [createSwapQuote({ baseAmount: 0.5 })],
    });

    act(() => {
      result.current.actions.setBaseAmount('0.1');
    });

    await waitFor(() => {
      expect(result.current.quoteQuery.status).toBe('success');
    });

    expect(result.current.quoteQuery.data?.selected).toBeDefined();
    expect(result.current.quoteQuery.data?.selected?.rawSwapQuote.baseAmount).toBe(0.5);
    expect(result.current.state.baseAmount).toBe('0.1');

    expect(result.current.networkFeeQuery.fetchStatus).toBe('idle');
  });
});

describe('fee tier selection', () => {
  it('default selection is standard tier', async () => {
    const result = renderUseSwapState({
      baseAsset: defaultBtcAsset,
      targetAsset: defaultStxAsset,
      swapQuotes: [createSwapQuote({ baseAmount: 0.1 })],
    });

    act(() => result.current.actions.setBaseAmount('0.1'));

    await waitFor(() => {
      expect(result.current.networkFeeQuery.status).toBe('success');
    });

    const feeData = result.current.networkFeeQuery.data;
    assert(feeData?.mode === 'tiered');
    assert(feeData.selected.type === 'tiered');
    expect(feeData.selected.type).toBe('tiered');
    expect(feeData.selected.tier).toBe('standard');
  });

  it.each(['low', 'standard', 'high'] as const)(
    'selecting %s tier updates state and uses correct fee value',
    async tier => {
      const result = renderUseSwapState({
        baseAsset: defaultBtcAsset,
        targetAsset: defaultStxAsset,
        swapQuotes: [createSwapQuote({ baseAmount: 0.1 })],
      });

      act(() => result.current.actions.setBaseAmount('0.1'));

      await waitFor(() => {
        expect(result.current.networkFeeQuery.status).toBe('success');
      });

      act(() => result.current.actions.setFeeTier(tier));

      const feeData = result.current.networkFeeQuery.data;
      assert(feeData?.mode === 'tiered');
      assert(feeData.selected.type === 'tiered');
      expect(feeData.selected.tier).toBe(tier);

      const tierOption = feeData.options.find(opt => opt.tier === tier);
      assert(tierOption);
      expect(feeData.calculation.value).toEqual(tierOption.value);
    }
  );
});

describe('custom fees', () => {
  it('setting custom fee changes selection type to custom', async () => {
    const result = renderUseSwapState({
      baseAsset: defaultBtcAsset,
      targetAsset: defaultStxAsset,
      swapQuotes: [createSwapQuote({ baseAmount: 0.1 })],
    });

    act(() => result.current.actions.setBaseAmount('0.1'));

    await waitFor(() => {
      expect(result.current.networkFeeQuery.status).toBe('success');
    });

    act(() => result.current.actions.setCustomFee(25000));

    const feeData = result.current.networkFeeQuery.data;
    assert(feeData?.mode === 'tiered');
    assert(feeData.selected.type === 'custom');
    expect(feeData.selected.type).toBe('custom');
    expect(feeData.selected.value).toBe(25000);
  });

  it('custom fee value is reflected in networkFeeQuery.data.value', async () => {
    const result = renderUseSwapState({
      baseAsset: defaultBtcAsset,
      targetAsset: defaultStxAsset,
      swapQuotes: [createSwapQuote({ baseAmount: 0.1 })],
    });

    act(() => result.current.actions.setBaseAmount('0.1'));

    await waitFor(() => {
      expect(result.current.networkFeeQuery.status).toBe('success');
    });

    act(() => result.current.actions.setCustomFee(30000));

    const feeData = result.current.networkFeeQuery.data;
    assert(feeData?.mode === 'tiered');
    assert(feeData.selected.type === 'custom');

    expect(feeData.calculation.value.amount.toNumber()).toBe(30000000);
  });

  it('custom fee takes precedence over tier when both are set', async () => {
    const result = renderUseSwapState({
      baseAsset: defaultBtcAsset,
      targetAsset: defaultStxAsset,
      swapQuotes: [createSwapQuote({ baseAmount: 0.1 })],
    });

    act(() => result.current.actions.setBaseAmount('0.1'));

    await waitFor(() => {
      expect(result.current.networkFeeQuery.status).toBe('success');
    });

    act(() => result.current.actions.setFeeTier('low'));

    let feeData = result.current.networkFeeQuery.data;
    assert(feeData?.mode === 'tiered');
    assert(feeData.selected.type === 'tiered');
    expect(feeData.selected.tier).toBe('low');

    act(() => result.current.actions.setCustomFee(35000));

    feeData = result.current.networkFeeQuery.data;
    assert(feeData?.mode === 'tiered');
    assert(feeData.selected.type === 'custom');
    expect(feeData.selected.value).toBe(35000);
    expect(feeData.calculation.value.amount.toNumber()).toBe(35000000);
  });
});

describe('fee and balance interaction', () => {
  it('fees update when base asset changes', async () => {
    const btcAsset = createAccountSwapAsset({
      asset: defaultBtcAsset,
      balance: { crypto: 100_000_000, quote: 50_000_00 },
    });

    const stxAsset = createAccountSwapAsset({
      asset: defaultStxAsset,
      balance: { crypto: 500_000_000, quote: 5_000_00 },
    });

    const result = renderUseSwapState({
      baseAsset: defaultBtcAsset,
      targetAsset: defaultStxAsset,
      baseSwapAssets: [btcAsset, stxAsset],
      swapQuotes: [createSwapQuote({ baseAmount: 0.1 })],
    });

    act(() => result.current.actions.setBaseAmount('0.1'));
    await waitFor(() => {
      expect(result.current.networkFeeQuery.status).toBe('success');
    });

    const firstFeeData = result.current.networkFeeQuery.data;

    act(() => result.current.actions.setBaseSwapAsset(stxAsset));
    await waitFor(() => {
      expect(result.current.networkFeeQuery.data).not.toBe(firstFeeData);
    });
  });

  it('fees update when base amount changes', async () => {
    const result = renderUseSwapState({
      baseAsset: defaultBtcAsset,
      targetAsset: defaultStxAsset,
      swapQuotes: [createSwapQuote({ baseAmount: 0.1 })],
    });

    act(() => result.current.actions.setBaseAmount('0.1'));
    await waitFor(() => {
      expect(result.current.networkFeeQuery.status).toBe('success');
    });

    const firstFeeData = result.current.networkFeeQuery.data;

    act(() => result.current.actions.setBaseAmount('0.2'));
    await waitFor(() => {
      expect(result.current.networkFeeQuery.data).not.toBe(firstFeeData);
    });
  });

  it('fees remain idle when amount is zero', async () => {
    const result = renderUseSwapState({
      baseAsset: defaultBtcAsset,
      targetAsset: defaultStxAsset,
    });

    expect(result.current.state.baseAmount).toBe('0');

    await waitFor(() => {
      expect(result.current.networkFeeQuery.fetchStatus).not.toBe('success');
    });
  });
});

describe('edge cases', () => {
  it('changing base asset resets fee tier to standard', async () => {
    const btcAsset = createAccountSwapAsset({
      asset: defaultBtcAsset,
      balance: { crypto: 100_000_000, quote: 50_000_00 },
    });

    const stxAsset = createAccountSwapAsset({
      asset: defaultStxAsset,
      balance: { crypto: 500_000_000, quote: 5_000_00 },
    });

    const result = renderUseSwapState({
      baseAsset: defaultBtcAsset,
      targetAsset: defaultStxAsset,
      baseSwapAssets: [btcAsset, stxAsset],
      swapQuotes: [createSwapQuote({ baseAmount: 0.1 })],
    });

    act(() => result.current.actions.setBaseAmount('0.1'));
    await waitFor(() => {
      expect(result.current.networkFeeQuery.status).toBe('success');
    });

    act(() => result.current.actions.setFeeTier('high'));
    expect(result.current.state.feeTier).toBe('high');

    act(() => result.current.actions.setBaseSwapAsset(stxAsset));
    expect(result.current.state.feeTier).toBe('standard');
  });

  it('flipping assets resets fee tier to standard', async () => {
    const btcAsset = createAccountSwapAsset({
      asset: defaultBtcAsset,
      balance: { crypto: 100_000_000, quote: 50_000_00 },
    });

    const stxAsset = createAccountSwapAsset({
      asset: defaultStxAsset,
      balance: { crypto: 500_000_000, quote: 5_000_00 },
    });

    const result = renderUseSwapState({
      baseSwapAssets: [btcAsset, stxAsset],
      targetSwapAssets: [btcAsset, stxAsset],
      swapQuotes: [createSwapQuote({ baseAmount: 0.1 })],
    });

    act(() => {
      result.current.actions.setBaseSwapAsset(btcAsset);
      result.current.actions.setTargetSwapAsset(stxAsset);
      result.current.actions.setBaseAmount('0.1');
    });

    await waitFor(() => {
      expect(result.current.networkFeeQuery.status).toBe('success');
    });

    act(() => result.current.actions.setFeeTier('low'));
    expect(result.current.state.feeTier).toBe('low');

    act(() => result.current.actions.flipAssets());
    expect(result.current.state.feeTier).toBe('standard');
  });
});
