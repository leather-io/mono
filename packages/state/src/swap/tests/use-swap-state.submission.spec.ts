import { STACKS_MAINNET } from '@stacks/network';
import { act, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { SwapQuote } from '@leather.io/models';
import { createMoney, createMoneyFromDecimal } from '@leather.io/utils';

import { SwapSubmissionResult } from '../swap-state.types';
import { SwapSigningCancelledError } from '../swap-submission.errors';
import {
  createAccountSwapAsset,
  createSwapQuote,
  defaultBtcAsset,
  defaultStxAsset,
} from './test-utils/fixtures';
import { renderUseSwapState } from './test-utils/render';
import { createStubStacksSigner } from './test-utils/services.stub';

describe('useSwapState - submission', () => {
  describe('canSubmit flag', () => {
    it('enabled when all prerequisites are met', async () => {
      const result = renderUseSwapState({
        baseAsset: defaultBtcAsset,
        targetAsset: defaultStxAsset,
        swapQuotes: [createSwapQuote({ baseAmount: 1 })],
      });

      act(() => {
        result.current.actions.setBaseAmount('1');
      });

      await waitFor(() => {
        expect(result.current.spendableAmountQuery.isSuccess).toBe(true);
        expect(result.current.quoteQuery.isSuccess).toBe(true);
        expect(result.current.networkFeeQuery.isSuccess).toBe(true);
      });

      expect(result.current.validation.isValid).toBe(true);
      expect(result.current.quoteQuery.data?.selected).toBeDefined();
      expect(result.current.spendableAmountQuery.isFetching).toBe(false);
      expect(result.current.networkFeeQuery.isFetching).toBe(false);
      expect(result.current.quoteQuery.isRefetching).toBe(false);
      expect(result.current.canSubmit).toBe(true);
    });

    it("disabled when there's no selected quote", async () => {
      const result = renderUseSwapState({
        baseAsset: defaultBtcAsset,
        targetAsset: defaultStxAsset,
        swapQuotes: [],
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
        expect(result.current.spendableAmountQuery.isSuccess).toBe(true);
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
        expect(result.current.spendableAmountQuery.isSuccess).toBe(true);
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
        expect(result.current.spendableAmountQuery.isSuccess).toBe(true);
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
        expect(result.current.spendableAmountQuery.isSuccess).toBe(true);
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
        expect(result.current.spendableAmountQuery.isSuccess).toBe(true);
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

    it('stays submittable while the quote refetches in the background', async () => {
      const quotes = [createSwapQuote({ baseAmount: 1 })];
      let resolveRefetch: ((value: SwapQuote[]) => void) | undefined;
      let quoteCallCount = 0;

      const result = renderUseSwapState({
        baseAsset: defaultBtcAsset,
        targetAsset: defaultStxAsset,
        getSwapQuotes() {
          quoteCallCount += 1;
          if (quoteCallCount === 1) return Promise.resolve(quotes);
          return new Promise(resolve => {
            resolveRefetch = resolve;
          });
        },
      });

      act(() => result.current.actions.setBaseAmount('1'));
      await waitFor(() => {
        expect(result.current.canSubmit).toBe(true);
        expect(result.current.quoteQuery.isRefetching).toBe(false);
      });

      act(() => {
        void result.current.quoteQuery.refetch();
      });
      await waitFor(() => {
        expect(result.current.quoteQuery.isRefetching).toBe(true);
      });
      expect(result.current.canSubmit).toBe(true);

      act(() => resolveRefetch?.(quotes));
      await waitFor(() => {
        expect(result.current.quoteQuery.isRefetching).toBe(false);
      });
      expect(result.current.canSubmit).toBe(true);
    });
  });

  describe('submit', () => {
    it('resolves with the broadcast txid and tracks submission events', async () => {
      const trackEvent = vi.fn(() => Promise.resolve());
      const broadcast = vi.fn().mockResolvedValue({ txid: 'test-txid' });

      const result = renderUseSwapState({
        baseAsset: defaultBtcAsset,
        targetAsset: defaultStxAsset,
        swapQuotes: [createSwapQuote({ baseAmount: 1 })],
        trackEvent,
        dependencies: {
          stacks: {
            stacksSigner: createStubStacksSigner(),
            stacksNetwork: STACKS_MAINNET,
            broadcast,
            nextNonce: undefined,
          },
        },
      });

      act(() => result.current.actions.setBaseAmount('1'));
      await waitFor(() => {
        expect(result.current.canSubmit).toBe(true);
      });

      let submissionResult: SwapSubmissionResult | undefined;
      await act(async () => {
        submissionResult = await result.current.submit();
      });

      expect(submissionResult).toEqual({ status: 'submitted', txid: 'test-txid' });
      expect(broadcast).toHaveBeenCalledOnce();
      expect(trackEvent).toHaveBeenCalledWith('swap_submitted', expect.any(Object));
      expect(trackEvent).toHaveBeenCalledWith('swap_submission_success', expect.any(Object));
    });

    it('rejects when called while canSubmit is false', async () => {
      const result = renderUseSwapState({
        baseAsset: defaultBtcAsset,
        targetAsset: defaultStxAsset,
        swapQuotes: [],
      });

      await act(async () => {
        await expect(result.current.submit()).rejects.toThrowError(
          'submit() called when canSubmit=false'
        );
      });
    });

    it('rejects and tracks failure when broadcast fails', async () => {
      const trackEvent = vi.fn(() => Promise.resolve());
      const onSwapSubmitted = vi.fn();
      const broadcast = vi.fn().mockRejectedValue(new Error('broadcast failed'));

      const result = renderUseSwapState({
        baseAsset: defaultBtcAsset,
        targetAsset: defaultStxAsset,
        swapQuotes: [createSwapQuote({ baseAmount: 1 })],
        trackEvent,
        dependencies: {
          stacks: {
            stacksSigner: createStubStacksSigner(),
            stacksNetwork: STACKS_MAINNET,
            broadcast,
            nextNonce: undefined,
          },
          onSwapSubmitted,
        },
      });

      act(() => result.current.actions.setBaseAmount('1'));
      await waitFor(() => {
        expect(result.current.canSubmit).toBe(true);
      });

      await act(async () => {
        await expect(result.current.submit()).rejects.toThrowError('broadcast failed');
      });

      expect(trackEvent).toHaveBeenCalledWith('swap_submission_failure', expect.any(Object));
      expect(onSwapSubmitted).not.toHaveBeenCalled();
    });

    it('notifies onSwapSubmitted exactly once with the submission result', async () => {
      const onSwapSubmitted = vi.fn();

      const result = renderUseSwapState({
        baseAsset: defaultBtcAsset,
        targetAsset: defaultStxAsset,
        swapQuotes: [createSwapQuote({ baseAmount: 1 })],
        dependencies: { onSwapSubmitted },
      });

      act(() => result.current.actions.setBaseAmount('1'));
      await waitFor(() => {
        expect(result.current.canSubmit).toBe(true);
      });

      await act(async () => {
        await result.current.submit();
      });

      expect(onSwapSubmitted).toHaveBeenCalledTimes(1);
      expect(onSwapSubmitted).toHaveBeenCalledWith({ status: 'submitted', txid: 'test-txid' });
    });
  });
});

describe('useSwapState - signing cancellation', () => {
  it('rejects with a signing cancellation without tracking a failure', async () => {
    const trackEvent = vi.fn();
    const deviceCancelMessage = 'User canceled the operation.';
    const sign = vi.fn().mockRejectedValue(new Error(deviceCancelMessage));

    const result = renderUseSwapState({
      baseAsset: defaultBtcAsset,
      targetAsset: defaultStxAsset,
      swapQuotes: [createSwapQuote({ baseAmount: 1 })],
      trackEvent,
      dependencies: {
        stacks: {
          stacksSigner: { ...createStubStacksSigner(), sign },
          stacksNetwork: STACKS_MAINNET,
          broadcast: vi.fn(),
          nextNonce: undefined,
        },
        isSigningCancelledError: error =>
          error instanceof Error && error.message === deviceCancelMessage,
      },
    });

    act(() => result.current.actions.setBaseAmount('1'));
    await waitFor(() => {
      expect(result.current.canSubmit).toBe(true);
    });

    await act(async () => {
      await expect(result.current.submit()).rejects.toBeInstanceOf(SwapSigningCancelledError);
    });

    expect(sign).toHaveBeenCalledOnce();
    expect(trackEvent).not.toHaveBeenCalledWith('swap_submission_failure', expect.any(Object));
  });
});
