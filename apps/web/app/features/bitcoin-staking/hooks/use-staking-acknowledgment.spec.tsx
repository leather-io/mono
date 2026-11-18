import { act, renderHook } from '@testing-library/react';
import { describe, expect, test } from 'vitest';

import { useStakingAcknowledgment } from './use-staking-acknowledgment';

describe(useStakingAcknowledgment.name, () => {
  test('requires a fresh acknowledgment when details change, even when returning to the original choice', () => {
    const { result, rerender } = renderHook(({ context }) => useStakingAcknowledgment(context), {
      initialProps: { context: 'fast-pool:100:12' },
    });
    expect(result.current.accepted).toBe(false);
    act(() => result.current.setAccepted(true));
    expect(result.current.accepted).toBe(true);
    rerender({ context: 'planbetter:100:12' });
    expect(result.current.accepted).toBe(false);
    rerender({ context: 'fast-pool:100:12' });
    expect(result.current.accepted).toBe(false);
  });

  test('preserves acknowledgment for unchanged details and lets the user withdraw it', () => {
    const { result, rerender } = renderHook(() => useStakingAcknowledgment('fast-pool:100:12'));
    act(() => result.current.setAccepted(true));
    rerender();
    expect(result.current.accepted).toBe(true);
    act(() => result.current.setAccepted(false));
    expect(result.current.accepted).toBe(false);
  });

  test('flags a confirm attempt without acknowledgment until the user ticks or the details change', () => {
    const { result, rerender } = renderHook(({ context }) => useStakingAcknowledgment(context), {
      initialProps: { context: 'fast-pool:100:12' },
    });
    expect(result.current.isInvalid).toBe(false);
    let allowed = true;
    act(() => {
      allowed = result.current.requireAccepted();
    });
    expect(allowed).toBe(false);
    expect(result.current.isInvalid).toBe(true);
    rerender({ context: 'fast-pool:200:12' });
    expect(result.current.isInvalid).toBe(false);
    act(() => {
      result.current.requireAccepted();
    });
    act(() => result.current.setAccepted(true));
    expect(result.current.isInvalid).toBe(false);
    act(() => {
      allowed = result.current.requireAccepted();
    });
    expect(allowed).toBe(true);
  });
});
