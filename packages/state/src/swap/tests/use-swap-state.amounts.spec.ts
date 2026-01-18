import { act, waitFor } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { createMoney } from '@leather.io/utils';

import { createAccountSwapAsset, defaultBtcAsset, defaultStxAsset } from './test-utils/fixtures';
import { renderUseSwapState } from './test-utils/render';

describe('amount presets', () => {
  describe('setting preset percentages', () => {
    it('sets base amount to 25%, 50%, 75%, and 100% of available balance in crypto mode', async () => {
      const btcAsset = createAccountSwapAsset({
        asset: defaultBtcAsset,
        balance: { crypto: 100_000_000, quote: 50_000_00 },
      });
      const result = renderUseSwapState({
        baseSwapAssets: [btcAsset],
        maxSpendAmount: 100_000_000,
      });

      act(() => result.current.actions.setBaseSwapAsset(btcAsset));
      await waitFor(() => expect(result.current.state.isInputReady).toBe(true));
      expect(result.current.state.inputCurrencyMode).toBe('crypto');

      act(() => result.current.actions.setBaseAmountByPercentage(0.25));
      expect(result.current.state.baseAmount).toBe('0.25');

      act(() => result.current.actions.setBaseAmountByPercentage(0.5));
      expect(result.current.state.baseAmount).toBe('0.5');

      act(() => result.current.actions.setBaseAmountByPercentage(0.75));
      expect(result.current.state.baseAmount).toBe('0.75');

      act(() => result.current.actions.setBaseAmountByPercentage(1));
      expect(result.current.state.baseAmount).toBe('1');
    });

    it('sets base amount to 25%, 50%, 75%, and 100% of available balance in quote mode', async () => {
      const btcAsset = createAccountSwapAsset({
        asset: defaultBtcAsset,
        balance: { crypto: 100_000_000, quote: 50_000_00 },
      });

      const result = renderUseSwapState({
        baseSwapAssets: [btcAsset],
        maxSpendAmount: 100_000_000,
      });

      act(() => result.current.actions.setBaseSwapAsset(btcAsset));
      await waitFor(() => expect(result.current.state.isInputReady).toBe(true));
      act(() => result.current.actions.toggleInputCurrencyMode());
      expect(result.current.state.inputCurrencyMode).toBe('quote');

      act(() => result.current.actions.setBaseAmountByPercentage(0.25));
      expect(result.current.state.baseAmount).toBe('12500');

      act(() => result.current.actions.setBaseAmountByPercentage(0.5));
      expect(result.current.state.baseAmount).toBe('25000');

      act(() => result.current.actions.setBaseAmountByPercentage(0.75));
      expect(result.current.state.baseAmount).toBe('37500');

      act(() => result.current.actions.setBaseAmountByPercentage(1));
      expect(result.current.state.baseAmount).toBe('50000');
    });
  });

  describe('preset edge cases', () => {
    it('returns early when no base asset is selected', () => {
      const result = renderUseSwapState();
      expect(result.current.state.baseSwapAsset).toBeNull();
      act(() => result.current.actions.setBaseAmountByPercentage(0.5));
      expect(result.current.state.baseAmount).toBe('0');
    });

    it('returns early when base asset has no balance', () => {
      const assetWithoutBalance = createAccountSwapAsset({
        asset: defaultBtcAsset,
      });
      const result = renderUseSwapState();
      act(() => result.current.actions.setBaseSwapAsset(assetWithoutBalance));
      expect(result.current.state.baseSwapAsset?.balance).toBeUndefined();
      act(() => result.current.actions.setBaseAmountByPercentage(0.5));
      expect(result.current.state.baseAmount).toBe('0');
    });

    it('handles zero available balance correctly', async () => {
      const zeroBalanceAsset = createAccountSwapAsset({
        asset: defaultBtcAsset,
        balance: { crypto: 0, quote: 0 },
      });
      const result = renderUseSwapState({
        baseSwapAssets: [zeroBalanceAsset],
        maxSpendAmount: 0,
      });
      act(() => result.current.actions.setBaseSwapAsset(zeroBalanceAsset));
      await waitFor(() => expect(result.current.state.isInputReady).toBe(true));
      act(() => result.current.actions.setBaseAmountByPercentage(0.5));
      expect(result.current.state.baseAmount).toBe('0');
      act(() => result.current.actions.setBaseAmountByPercentage(1));
      expect(result.current.state.baseAmount).toBe('0');
    });

    it('preserves precision with very small balances', async () => {
      const smallBalanceAsset = createAccountSwapAsset({
        asset: defaultBtcAsset,
        balance: { crypto: 100, quote: 5 },
      });
      const result = renderUseSwapState({
        baseSwapAssets: [smallBalanceAsset],
        maxSpendAmount: 100,
      });
      act(() => result.current.actions.setBaseSwapAsset(smallBalanceAsset));
      await waitFor(() => expect(result.current.state.isInputReady).toBe(true));
      act(() => result.current.actions.setBaseAmountByPercentage(0.5));
      expect(result.current.state.baseAmount).toBe('0.0000005');
      act(() => result.current.actions.setBaseAmountByPercentage(0.25));
      expect(result.current.state.baseAmount).toBe('0.00000025');
      act(() => result.current.actions.setBaseAmountByPercentage(1));
      expect(result.current.state.baseAmount).toBe('0.000001');
    });

    it('handles very large balances without overflow', async () => {
      const largeBalanceAsset = createAccountSwapAsset({
        asset: defaultBtcAsset,
        balance: { crypto: 2100000000000000, quote: 105000000000000 },
      });
      const result = renderUseSwapState({
        baseSwapAssets: [largeBalanceAsset],
        maxSpendAmount: 2100000000000000,
      });
      act(() => result.current.actions.setBaseSwapAsset(largeBalanceAsset));
      await waitFor(() => expect(result.current.state.isInputReady).toBe(true));
      act(() => result.current.actions.setBaseAmountByPercentage(0.25));
      expect(result.current.state.baseAmount).toBe('5250000');
      act(() => result.current.actions.setBaseAmountByPercentage(0.5));
      expect(result.current.state.baseAmount).toBe('10500000');
      act(() => result.current.actions.setBaseAmountByPercentage(1));
      expect(result.current.state.baseAmount).toBe('21000000');
    });

    it('maintains precision with very small percentage calculations', async () => {
      const precisionAsset = createAccountSwapAsset({
        asset: defaultBtcAsset,
        balance: { crypto: 546, quote: 6 },
      });
      const result = renderUseSwapState({
        baseSwapAssets: [precisionAsset],
        maxSpendAmount: 546,
      });
      act(() => result.current.actions.setBaseSwapAsset(precisionAsset));
      await waitFor(() => expect(result.current.state.isInputReady).toBe(true));
      act(() => result.current.actions.setBaseAmountByPercentage(0.25));

      const expectedValue = 0.00000546 * 0.25;
      expect(parseFloat(result.current.state.baseAmount)).toBeCloseTo(expectedValue, 7);
      act(() => result.current.actions.setBaseAmountByPercentage(1));
      expect(result.current.state.baseAmount).toBe('0.00000546');
      expect(result.current.state.isSendingMax).toBe(true);
    });
  });

  describe('presets with currency mode switching', () => {
    it('calculates preset correctly after toggling from crypto to quote mode', async () => {
      const btcAsset = createAccountSwapAsset({
        asset: defaultBtcAsset,
        balance: { crypto: 100_000_000, quote: 50_000_00 },
      });
      const marketData = {
        pair: { base: 'BTC', quote: 'USD' },
        price: createMoney(50_000_00, 'USD', 2),
      };
      const result = renderUseSwapState({
        baseSwapAssets: [btcAsset],
        marketData,
      });

      act(() => result.current.actions.setBaseSwapAsset(btcAsset));
      await waitFor(() => expect(result.current.state.isInputReady).toBe(true));
      act(() => result.current.actions.setBaseAmount('0.1'));
      await waitFor(() => expect(result.current.state.secondaryAmount.status).toBe('success'));

      act(() => result.current.actions.setBaseAmountByPercentage(0.5));
      expect(result.current.state.baseAmount).toBe('0.5');

      act(() => result.current.actions.toggleInputCurrencyMode());
      expect(result.current.state.inputCurrencyMode).toBe('quote');

      act(() => result.current.actions.setBaseAmountByPercentage(0.25));
      expect(result.current.state.baseAmount).toBe('12500');
    });

    it('calculates preset correctly after toggling from quote to crypto mode', async () => {
      const btcAsset = createAccountSwapAsset({
        asset: defaultBtcAsset,
        balance: { crypto: 100_000_000, quote: 50_000_00 },
      });
      const marketData = {
        pair: { base: 'BTC', quote: 'USD' },
        price: createMoney(50_000_00, 'USD', 2),
      };
      const result = renderUseSwapState({
        baseSwapAssets: [btcAsset],
        marketData,
      });
      act(() => result.current.actions.setBaseSwapAsset(btcAsset));
      await waitFor(() => expect(result.current.state.isInputReady).toBe(true));
      act(() => result.current.actions.setBaseAmount('0.1'));
      await waitFor(() => expect(result.current.state.secondaryAmount.status).toBe('success'));

      act(() => result.current.actions.toggleInputCurrencyMode());
      expect(result.current.state.inputCurrencyMode).toBe('quote');

      act(() => result.current.actions.setBaseAmountByPercentage(0.5));
      expect(result.current.state.baseAmount).toBe('25000');

      act(() => result.current.actions.toggleInputCurrencyMode());
      expect(result.current.state.inputCurrencyMode).toBe('crypto');

      act(() => result.current.actions.setBaseAmountByPercentage(0.75));
      expect(result.current.state.baseAmount).toBe('0.75');
    });

    it('respects the current input currency mode when calculating preset', async () => {
      const btcAsset = createAccountSwapAsset({
        asset: defaultBtcAsset,
        balance: { crypto: 100_000_000, quote: 50_000_00 },
      });
      const marketData = {
        pair: { base: 'BTC', quote: 'USD' },
        price: createMoney(50_000_00, 'USD', 2),
      };
      const result = renderUseSwapState({
        baseSwapAssets: [btcAsset],
        marketData,
        maxSpendAmount: 100_000_000,
      });

      act(() => result.current.actions.setBaseSwapAsset(btcAsset));
      await waitFor(() => expect(result.current.state.isInputReady).toBe(true));
      act(() => result.current.actions.setBaseAmount('0.1'));
      await waitFor(() => expect(result.current.state.secondaryAmount.status).toBe('success'));
      expect(result.current.state.inputCurrencyMode).toBe('crypto');

      act(() => result.current.actions.setBaseAmountByPercentage(1));
      expect(result.current.state.baseAmount).toBe('1');

      act(() => result.current.actions.toggleInputCurrencyMode());
      expect(result.current.state.inputCurrencyMode).toBe('quote');

      act(() => result.current.actions.setBaseAmountByPercentage(1));
      expect(result.current.state.baseAmount).toBe('50000');
    });
  });
});

describe('isSendingMax flag', () => {
  describe('basic isSendingMax detection', () => {
    it('returns true when amount equals 100% in crypto mode', async () => {
      const btcAsset = createAccountSwapAsset({
        asset: defaultBtcAsset,
        balance: { crypto: 100_000_000, quote: 50_000_00 },
      });
      const result = renderUseSwapState({
        baseSwapAssets: [btcAsset],
      });

      act(() => result.current.actions.setBaseSwapAsset(btcAsset));
      await waitFor(() => expect(result.current.state.isInputReady).toBe(true));
      expect(result.current.state.inputCurrencyMode).toBe('crypto');

      act(() => result.current.actions.setBaseAmountByPercentage(1));
      expect(result.current.state.isSendingMax).toBe(true);
    });

    it('returns true when amount equals 100% in quote mode', async () => {
      const btcAsset = createAccountSwapAsset({
        asset: defaultBtcAsset,
        balance: { crypto: 100_000_000, quote: 50_000_00 },
      });
      const marketData = {
        pair: { base: 'BTC', quote: 'USD' },
        price: createMoney(50_000_00, 'USD', 2),
      };
      const result = renderUseSwapState({
        baseSwapAssets: [btcAsset],
        marketData,
      });
      act(() => result.current.actions.setBaseSwapAsset(btcAsset));
      await waitFor(() => expect(result.current.state.isInputReady).toBe(true));
      act(() => result.current.actions.setBaseAmount('0.1'));
      await waitFor(() => expect(result.current.state.secondaryAmount.status).toBe('success'));

      act(() => result.current.actions.toggleInputCurrencyMode());
      expect(result.current.state.inputCurrencyMode).toBe('quote');

      act(() => result.current.actions.setBaseAmountByPercentage(1));
      expect(result.current.state.isSendingMax).toBe(true);
    });

    it('returns false when amount is less than 100%', async () => {
      const btcAsset = createAccountSwapAsset({
        asset: defaultBtcAsset,
        balance: { crypto: 100_000_000, quote: 50_000_00 },
      });
      const result = renderUseSwapState({
        baseSwapAssets: [btcAsset],
      });

      act(() => result.current.actions.setBaseSwapAsset(btcAsset));
      await waitFor(() => expect(result.current.state.isInputReady).toBe(true));
      act(() => result.current.actions.setBaseAmountByPercentage(0.25));
      expect(result.current.state.isSendingMax).toBe(false);

      act(() => result.current.actions.setBaseAmountByPercentage(0.5));
      expect(result.current.state.isSendingMax).toBe(false);

      act(() => result.current.actions.setBaseAmountByPercentage(0.75));
      expect(result.current.state.isSendingMax).toBe(false);
    });
  });

  describe('isSendingMax with manual input', () => {
    it('becomes true when manually entering exact spendable amount in crypto mode', async () => {
      const btcAsset = createAccountSwapAsset({
        asset: defaultBtcAsset,
        balance: { crypto: 12345678, quote: 617284 },
      });
      const result = renderUseSwapState({
        baseSwapAssets: [btcAsset],
      });

      act(() => result.current.actions.setBaseSwapAsset(btcAsset));
      await waitFor(() => expect(result.current.state.isInputReady).toBe(true));
      expect(result.current.state.inputCurrencyMode).toBe('crypto');

      act(() => result.current.actions.setBaseAmount('2'));
      expect(result.current.state.isSendingMax).toBe(true);
    });

    it('becomes true when manually entering exact spendable amount in quote mode', async () => {
      const btcAsset = createAccountSwapAsset({
        asset: defaultBtcAsset,
        balance: { crypto: 100_000_000, quote: 50_000_00 },
      });
      const marketData = {
        pair: { base: 'BTC', quote: 'USD' },
        price: createMoney(50_000_00, 'USD', 2),
      };
      const result = renderUseSwapState({
        baseSwapAssets: [btcAsset],
        marketData,
      });
      act(() => result.current.actions.setBaseSwapAsset(btcAsset));
      await waitFor(() => expect(result.current.state.isInputReady).toBe(true));
      act(() => result.current.actions.setBaseAmount('0.1'));
      await waitFor(() => expect(result.current.state.secondaryAmount.status).toBe('success'));
      act(() => result.current.actions.toggleInputCurrencyMode());
      expect(result.current.state.inputCurrencyMode).toBe('quote');

      act(() => result.current.actions.setBaseAmount('100000'));
      expect(result.current.state.isSendingMax).toBe(true);
    });

    it('becomes false when editing amount down from max', async () => {
      const btcAsset = createAccountSwapAsset({
        asset: defaultBtcAsset,
        balance: { crypto: 100_000_000, quote: 50_000_00 },
      });
      const result = renderUseSwapState({
        baseSwapAssets: [btcAsset],
      });

      act(() => result.current.actions.setBaseSwapAsset(btcAsset));
      await waitFor(() => expect(result.current.state.isInputReady).toBe(true));
      act(() => result.current.actions.setBaseAmountByPercentage(1));
      expect(result.current.state.isSendingMax).toBe(true);

      act(() => result.current.actions.setBaseAmount('0.99999'));
      expect(result.current.state.isSendingMax).toBe(false);
    });

    it('remains accurate after toggling currency modes', async () => {
      const btcAsset = createAccountSwapAsset({
        asset: defaultBtcAsset,
        balance: { crypto: 100_000_000, quote: 50_000_00 },
      });
      const marketData = {
        pair: { base: 'BTC', quote: 'USD' },
        price: createMoney(50_000_00, 'USD', 2),
      };
      const result = renderUseSwapState({
        baseSwapAssets: [btcAsset],
        marketData,
      });
      act(() => result.current.actions.setBaseSwapAsset(btcAsset));
      await waitFor(() => expect(result.current.state.isInputReady).toBe(true));
      act(() => result.current.actions.setBaseAmount('0.1'));
      await waitFor(() => expect(result.current.state.secondaryAmount.status).toBe('success'));

      act(() => result.current.actions.setBaseAmountByPercentage(1));
      expect(result.current.state.isSendingMax).toBe(true);

      act(() => result.current.actions.toggleInputCurrencyMode());
      expect(result.current.state.isSendingMax).toBe(true);
    });
  });
});

describe('preset and isSendingMax integration', () => {
  it('sets isSendingMax to true after selecting MAX preset', async () => {
    const btcAsset = createAccountSwapAsset({
      asset: defaultBtcAsset,
      balance: { crypto: 100_000_000, quote: 50_000_00 },
    });
    const result = renderUseSwapState({
      baseSwapAssets: [btcAsset],
      maxSpendAmount: 100_000_000,
    });

    act(() => result.current.actions.setBaseSwapAsset(btcAsset));
    await waitFor(() => expect(result.current.state.isInputReady).toBe(true));
    act(() => result.current.actions.setBaseAmountByPercentage(1));
    expect(result.current.state.baseAmount).toBe('1');
    expect(result.current.state.isSendingMax).toBe(true);
  });

  it('sets isSendingMax to false after selecting a preset', async () => {
    const btcAsset = createAccountSwapAsset({
      asset: defaultBtcAsset,
      balance: { crypto: 100_000_000, quote: 50_000_00 },
    });
    const result = renderUseSwapState({
      baseSwapAssets: [btcAsset],
    });
    act(() => result.current.actions.setBaseSwapAsset(btcAsset));
    await waitFor(() => expect(result.current.state.isInputReady).toBe(true));
    act(() => result.current.actions.setBaseAmountByPercentage(0.25));
    expect(result.current.state.isSendingMax).toBe(false);
  });

  it('updates isSendingMax when switching between assets', async () => {
    const btcAsset = createAccountSwapAsset({
      asset: defaultBtcAsset,
      balance: { crypto: 100_000_000, quote: 50_000_00 },
    });
    const stxAsset = createAccountSwapAsset({
      asset: defaultStxAsset,
      balance: { crypto: 100000000, quote: 15000 },
    });
    const result = renderUseSwapState({
      baseSwapAssets: [btcAsset, stxAsset],
    });
    act(() => result.current.actions.setBaseSwapAsset(btcAsset));
    await waitFor(() => expect(result.current.state.isInputReady).toBe(true));
    act(() => result.current.actions.setBaseAmountByPercentage(1));
    expect(result.current.state.isSendingMax).toBe(true);

    //act(() => result.current.actions.setBaseSwapAsset(stxAsset));
    //expect(result.current.state.isSendingMax).toBe(false);
  });
});

describe('quote currency calculation', () => {
  it('calculates entered amount value in selected quote currency', async () => {
    const btcAsset = createAccountSwapAsset({
      asset: defaultBtcAsset,
      balance: { quote: 50000, crypto: 1 },
    });

    const marketData = {
      pair: { base: 'BTC', quote: 'USD' },
      price: createMoney(100_000_00, 'USD', 2),
    };

    const result = renderUseSwapState({
      baseSwapAssets: [btcAsset],
      marketData,
    });

    act(() => {
      result.current.actions.setBaseSwapAsset(btcAsset);
      result.current.actions.setBaseAmount('0.1');
    });
    expect(result.current.state.inputCurrencyMode).toBe('crypto');
    expect(result.current.state.baseAmount).toBe('0.1');

    await waitFor(() => expect(result.current.state.secondaryAmount.status).toBe('success'));
    expect(result.current.state.secondaryAmount.value?.amount.toNumber()).toBe(10_000_00);
  });

  it('switches to quote mode when base amount is set', async () => {
    const btcAsset = createAccountSwapAsset({
      asset: defaultBtcAsset,
      balance: { quote: 50000, crypto: 1 },
    });

    const marketData = {
      pair: { base: 'BTC', quote: 'USD' },
      price: createMoney(100_000_00, 'USD', 2),
    };

    const result = renderUseSwapState({
      baseSwapAssets: [btcAsset],
      marketData,
    });

    act(() => {
      result.current.actions.setBaseSwapAsset(btcAsset);
      result.current.actions.setBaseAmount('0.1');
    });
    await waitFor(() => expect(result.current.state.secondaryAmount.status).toBe('success'));
    expect(result.current.state.inputCurrencyMode).toBe('crypto');
    expect(result.current.state.baseAmount).toBe('0.1');
    expect(result.current.state.secondaryAmount.value?.amount.toNumber()).toBe(10_000_00);

    act(() => result.current.actions.toggleInputCurrencyMode());
    expect(result.current.state.inputCurrencyMode).toBe('quote');
    expect(result.current.state.baseAmount).toBe('10000');
    expect(result.current.state.secondaryAmount.value?.amount.toNumber()).toBe(10_000_000);
  });

  it('preserves exact values when toggled twice', async () => {
    const btcAsset = createAccountSwapAsset({
      asset: defaultBtcAsset,
      balance: { quote: 50000, crypto: 1 },
    });

    const marketData = {
      pair: { base: 'BTC', quote: 'USD' },
      price: createMoney(100_000_00, 'USD', 2),
    };

    const result = renderUseSwapState({
      baseSwapAssets: [btcAsset],
      marketData,
    });

    act(() => {
      result.current.actions.setBaseSwapAsset(btcAsset);
      result.current.actions.setBaseAmount('0.1');
    });

    await waitFor(() => expect(result.current.state.secondaryAmount.status).toBe('success'));

    act(() => result.current.actions.toggleInputCurrencyMode());
    expect(result.current.state.inputCurrencyMode).toBe('quote');
    expect(result.current.state.baseAmount).toBe('10000');

    act(() => result.current.actions.toggleInputCurrencyMode());
    expect(result.current.state.inputCurrencyMode).toBe('crypto');
    expect(result.current.state.baseAmount).toBe('0.1');
    expect(result.current.state.secondaryAmount.value?.amount.toNumber()).toBe(10_000_00);
  });
  it('returns idle state when no base asset is selected', () => {
    const result = renderUseSwapState({});

    expect(result.current.state.secondaryAmount.status).toBe('idle');
    expect(result.current.state.secondaryAmount.value).toBeNull();
  });

  it('returns pending state while market data is loading', () => {
    const btcAsset = createAccountSwapAsset({
      asset: defaultBtcAsset,
      balance: { quote: 50000, crypto: 1 },
    });

    const marketData = {
      pair: { base: 'BTC', quote: 'USD' },
      price: createMoney(100_000_00, 'USD', 2),
    };

    const result = renderUseSwapState({
      baseSwapAssets: [btcAsset],
      marketData,
    });

    act(() => result.current.actions.setBaseSwapAsset(btcAsset));
    expect(result.current.state.secondaryAmount.status).toBe('pending');
    expect(result.current.state.secondaryAmount.value).toBeNull();
  });

  it('returns error state when market data fails', async () => {
    const btcAsset = createAccountSwapAsset({
      asset: defaultBtcAsset,
      balance: { quote: 50000, crypto: 1 },
    });

    const result = renderUseSwapState({
      baseSwapAssets: [btcAsset],
    });

    act(() => result.current.actions.setBaseSwapAsset(btcAsset));
    await waitFor(() => expect(result.current.state.secondaryAmount.status).toBe('error'));
    expect(result.current.state.secondaryAmount.value).toBeNull();
  });
});
