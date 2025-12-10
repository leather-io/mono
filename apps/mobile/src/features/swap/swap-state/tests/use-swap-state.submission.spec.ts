import { act, waitFor } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { createMoney, createMoneyFromDecimal } from '@leather.io/utils';

import {
  createAccountSwapAsset,
  createSwapQuote,
  defaultBtcAsset,
  defaultStxAsset,
} from './test-utils/fixtures';
import { renderUseSwapState } from './test-utils/render';

describe('useSwapState - submission', () => {
  describe('canSubmit flag', () => {
    it('enabled when all prerequisites are met', async () => {
      const result = renderUseSwapState({
        baseAsset: defaultBtcAsset,
        targetAsset: defaultStxAsset,
        swapQuotes: [createSwapQuote({ baseAmount: 1 })], // quotes currently specify base amount as fractional number
      });

      act(() => {
        result.current.actions.setBaseAmount('1');
      });

      await waitFor(() => {
        expect(result.current.quoteQuery.isSuccess).toBe(true);
        expect(result.current.networkFeeQuery.isSuccess).toBe(true);
      });

      expect(result.current.validation.isValid).toBe(true);
      expect(result.current.quoteQuery.data?.selected).toBeDefined();
      expect(result.current.networkFeeQuery.isFetching).toBe(false);
      expect(result.current.quoteQuery.isRefetching).toBe(false);
      expect(result.current.canSubmit).toBe(true);
    });

    it("disabled when there's no selected quote", async () => {
      const result = renderUseSwapState({
        baseAsset: defaultBtcAsset,
        targetAsset: defaultStxAsset,
        swapQuotes: [], // No quotes available
      });

      act(() => {
        result.current.actions.setBaseAmount('1');
      });

      await waitFor(() => {
        expect(result.current.quoteQuery.isSuccess).toBe(true);
      });

      expect(result.current.validation.isValid).toBe(true);
      expect(result.current.quoteQuery.data?.selected).toBeUndefined();
      expect(result.current.canSubmit).toBe(false);
    });

    it('disabled when validation failed', async () => {
      const btcAsset = createAccountSwapAsset({
        asset: defaultBtcAsset,
        balance: { crypto: 10_000_000, quote: 5_000_00 },
      });

      const stxAsset = createAccountSwapAsset({
        asset: defaultStxAsset,
      });

      const result = renderUseSwapState({
        baseSwapAssets: [btcAsset],
        targetSwapAssets: [stxAsset],
        swapQuotes: [createSwapQuote({ baseAmount: 20 })],
      });

      act(() => {
        result.current.actions.setBaseSwapAsset(btcAsset);
        result.current.actions.setTargetSwapAsset(stxAsset);
        result.current.actions.setBaseAmount('20');
      });
      await waitFor(() => {
        expect(result.current.quoteQuery.isSuccess).toBe(true);
        expect(result.current.networkFeeQuery.isSuccess).toBe(true);
      });

      expect(result.current.validation.isValid).toBe(false);
      expect(result.current.validation.issues.baseAmount?.code).toBe('INSUFFICIENT_BALANCE');
      expect(result.current.canSubmit).toBe(false);
    });

    it('disabled when quote misaligned with current input', async () => {
      const result = renderUseSwapState({
        baseAsset: defaultBtcAsset,
        targetAsset: defaultStxAsset,
        swapQuotes: [createSwapQuote({ baseAmount: 1 })],
      });

      act(() => result.current.actions.setBaseAmount('1'));
      await waitFor(() => {
        expect(result.current.quoteQuery.isSuccess).toBe(true);
        expect(result.current.networkFeeQuery.isSuccess).toBe(true);
      });

      act(() => result.current.actions.setBaseAmount('2'));
      await waitFor(() => {
        expect(result.current.quoteQuery.isFetching).toBe(false);
      });

      expect(result.current.quoteQuery.data?.selected?.baseAmount).toEqual(
        createMoneyFromDecimal(1, 'BTC')
      );
      expect(result.current.state.baseAmount).toBe('2');
      expect(result.current.canSubmit).toBe(false);
    });
  });

  describe('quote alignment with current input', () => {
    it('is aligned when quote baseAmount matches crypto input', async () => {
      const result = renderUseSwapState({
        baseAsset: defaultBtcAsset,
        targetAsset: defaultStxAsset,
        swapQuotes: [createSwapQuote({ baseAmount: 1.5 })],
      });

      act(() => {
        result.current.actions.setBaseAmount('1.5');
      });

      await waitFor(() => {
        expect(result.current.quoteQuery.isSuccess).toBe(true);
        expect(result.current.networkFeeQuery.isSuccess).toBe(true);
      });

      expect(result.current.quoteQuery.data?.selected?.baseAmount).toEqual(
        createMoneyFromDecimal(1.5, 'BTC')
      );
      expect(result.current.canSubmit).toBe(true);
    });

    it('is misaligned when quote is for different amount than current input', async () => {
      const result = renderUseSwapState({
        baseAsset: defaultBtcAsset,
        targetAsset: defaultStxAsset,
        swapQuotes: [createSwapQuote({ baseAmount: 0.5 })],
      });

      act(() => result.current.actions.setBaseAmount('0.5'));
      await waitFor(() => {
        expect(result.current.quoteQuery.isSuccess).toBe(true);
        expect(result.current.canSubmit).toBe(true);
      });

      act(() => result.current.actions.setBaseAmount('0.75'));
      expect(result.current.canSubmit).toBe(false);
    });

    it('is aligned when entering amount in fiat mode', async () => {
      const result = renderUseSwapState({
        baseAsset: defaultBtcAsset,
        targetAsset: defaultStxAsset,
        swapQuotes: [createSwapQuote({ baseAmount: 0.001 })],
        marketData: {
          pair: { base: 'BTC', quote: 'USD' },
          price: createMoney(100_000_00, 'USD', 2),
        },
      });

      act(() => {
        result.current.actions.toggleInputCurrencyMode();
        result.current.actions.setBaseAmount('100');
      });

      await waitFor(() => {
        expect(result.current.quoteQuery.isSuccess).toBe(true);
        expect(result.current.networkFeeQuery.isSuccess).toBe(true);
      });

      expect(result.current.state.baseAmount).toBe('100');
      expect(result.current.quoteQuery.data?.selected?.baseAmount).toEqual(
        createMoneyFromDecimal(0.001, 'BTC')
      );
      expect(result.current.canSubmit).toBe(true);
    });

    it('maintains alignment when switching crypto - fiat - crypto', async () => {
      const result = renderUseSwapState({
        baseAsset: defaultBtcAsset,
        targetAsset: defaultStxAsset,
        swapQuotes: [createSwapQuote({ baseAmount: 0.01 })],
        marketData: {
          pair: { base: 'BTC', quote: 'USD' },
          price: createMoney(50000_00, 'USD', 2),
        },
      });

      act(() => result.current.actions.setBaseAmount('0.01'));
      await waitFor(() => {
        expect(result.current.quoteQuery.isSuccess).toBe(true);
        expect(result.current.canSubmit).toBe(true);
      });

      expect(result.current.state.inputCurrencyMode).toBe('crypto');
      expect(result.current.state.baseAmount).toBe('0.01');

      act(() => result.current.actions.toggleInputCurrencyMode());
      expect(result.current.state.inputCurrencyMode).toBe('quote');
      expect(result.current.state.baseAmount).toBe('500');
      expect(result.current.canSubmit).toBe(true);

      act(() => result.current.actions.toggleInputCurrencyMode());
      expect(result.current.state.inputCurrencyMode).toBe('crypto');
      expect(result.current.state.baseAmount).toBe('0.01');
      expect(result.current.canSubmit).toBe(true);
    });
  });
});
