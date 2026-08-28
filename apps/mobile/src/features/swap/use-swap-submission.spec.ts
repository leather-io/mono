import { renderHookWithProviders } from '@/tests/test-utils';
import { captureException } from '@sentry/react-native';
import { notifyManager } from '@tanstack/react-query';
import { act } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import { btcAsset, stxAsset } from '@leather.io/constants';
import {
  SwapSigningCancelledError,
  type SwapSubmissionQuoteSnapshot,
} from '@leather.io/state/swap';
import { createMoney } from '@leather.io/utils';

import { useSwapSubmission } from './use-swap-submission';

const { submit, dismiss } = vi.hoisted(() => ({ submit: vi.fn(), dismiss: vi.fn() }));

vi.mock('@leather.io/state/swap', async importOriginal => {
  const actual = await importOriginal<typeof import('@leather.io/state/swap')>();
  return { ...actual, useSwapContext: () => ({ submit }) };
});
vi.mock('@gorhom/bottom-sheet', () => ({ useBottomSheetModal: () => ({ dismiss }) }));
vi.mock('@sentry/react-native', () => ({ captureException: vi.fn() }));

notifyManager.setScheduler(callback => callback());

const accidentalTapSuppressionMs = 500;
const submissionDisplayDuration = 1800;
const successfulExitTimeout = 1200;

const quote: SwapSubmissionQuoteSnapshot = {
  baseAsset: btcAsset,
  targetAsset: stxAsset,
  baseAmount: createMoney(100000, 'BTC'),
  targetAmount: createMoney(5000000, 'STX'),
};

function renderSubmission() {
  const rendered = renderHookWithProviders(() => useSwapSubmission());
  act(() => {
    vi.advanceTimersByTime(accidentalTapSuppressionMs);
  });
  return rendered;
}

async function confirmSwap(rendered: ReturnType<typeof renderSubmission>) {
  await act(() => {
    rendered.result.current.confirm(quote);
    return Promise.resolve();
  });
}

async function settleSubmission() {
  await act(() => vi.advanceTimersByTimeAsync(submissionDisplayDuration));
}

describe(useSwapSubmission.name, () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.useRealTimers();
  });

  test('moves to success and dismisses the swap sheet after the exit timeout', async () => {
    submit.mockResolvedValue({ status: 'submitted', txid: 'abc' });
    const rendered = renderSubmission();

    await confirmSwap(rendered);
    expect(rendered.result.current.submission).toEqual({ status: 'submitting', quote });

    await settleSubmission();
    expect(rendered.result.current.submission).toEqual({ status: 'success', quote });
    expect(dismiss).not.toHaveBeenCalled();

    await act(() => vi.advanceTimersByTimeAsync(successfulExitTimeout));
    expect(dismiss).toHaveBeenCalledWith('swap');
  });

  test('moves to needs-attention and reports sbtc notification failures', async () => {
    submit.mockResolvedValue({
      status: 'sbtc-notification-failed',
      txid: 'abc',
      errorMessage: 'boom',
    });
    const rendered = renderSubmission();

    await confirmSwap(rendered);
    await settleSubmission();

    expect(rendered.result.current.submission).toEqual({
      status: 'needs-attention',
      quote,
      attention: { reason: 'sbtc-notification-failed', txid: 'abc' },
    });
    expect(captureException).toHaveBeenCalledOnce();
  });

  test('returns to idle without reporting when signing is cancelled', async () => {
    submit.mockRejectedValue(new SwapSigningCancelledError());
    const rendered = renderSubmission();

    await confirmSwap(rendered);
    await settleSubmission();

    expect(rendered.result.current.submission).toEqual({ status: 'idle' });
    expect(captureException).not.toHaveBeenCalled();
  });

  test('moves to failure with the quote snapshot on other errors', async () => {
    submit.mockRejectedValue(new Error('broadcast failed'));
    const rendered = renderSubmission();

    await confirmSwap(rendered);
    await settleSubmission();

    expect(rendered.result.current.submission).toEqual({ status: 'failure', quote });
  });

  test('ignores confirm while a submission is active', async () => {
    submit.mockReturnValue(new Promise(() => undefined));
    const rendered = renderSubmission();

    await confirmSwap(rendered);
    await confirmSwap(rendered);

    expect(submit).toHaveBeenCalledOnce();
  });

  test('ignores a second confirm before the mutation state has propagated', async () => {
    notifyManager.setScheduler(callback => setTimeout(callback, 0));
    try {
      submit.mockReturnValue(new Promise(() => undefined));
      const rendered = renderSubmission();

      await confirmSwap(rendered);
      await confirmSwap(rendered);

      expect(submit).toHaveBeenCalledOnce();
    } finally {
      notifyManager.setScheduler(callback => callback());
    }
  });

  test('ignores confirm within the accidental tap window after mount', async () => {
    const rendered = renderHookWithProviders(() => useSwapSubmission());

    await confirmSwap(rendered);

    expect(submit).not.toHaveBeenCalled();
    expect(rendered.result.current.submission).toEqual({ status: 'idle' });
  });

  test('reset returns to idle and dismissSwapSheet dismisses the swap sheet', async () => {
    submit.mockRejectedValue(new Error('broadcast failed'));
    const rendered = renderSubmission();

    await confirmSwap(rendered);
    await settleSubmission();
    act(() => rendered.result.current.reset());
    expect(rendered.result.current.submission).toEqual({ status: 'idle' });

    act(() => rendered.result.current.dismissSwapSheet());
    expect(dismiss).toHaveBeenCalledWith('swap');
  });
});
