import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { useNumericInput } from './use-numeric-input.shared';

vi.useFakeTimers();

describe('useNumericInput', () => {
  beforeEach(() => vi.clearAllTimers());
  afterEach(() => vi.clearAllMocks());

  describe('tap', () => {
    it('increments value by step on tap', () => {
      const onChange = vi.fn();
      const { result } = renderHook(() => useNumericInput({ value: 5, onChange }));

      act(() => {
        result.current.handlePressIn('increment');
        result.current.handlePressOut();
      });

      expect(onChange).toHaveBeenCalledOnce();
      expect(onChange).toHaveBeenCalledWith(6);
    });

    it('decrements value by step on tap', () => {
      const onChange = vi.fn();
      const { result } = renderHook(() => useNumericInput({ value: 5, onChange }));

      act(() => {
        result.current.handlePressIn('decrement');
        result.current.handlePressOut();
      });

      expect(onChange).toHaveBeenCalledOnce();
      expect(onChange).toHaveBeenCalledWith(4);
    });

    it('applies custom step size on tap', () => {
      const onChange = vi.fn();
      const { result } = renderHook(() => useNumericInput({ value: 10, onChange, step: 5 }));

      act(() => {
        result.current.handlePressIn('increment');
        result.current.handlePressOut();
      });

      expect(onChange).toHaveBeenCalledOnce();
      expect(onChange).toHaveBeenCalledWith(15);
    });
  });

  describe('long press', () => {
    it('begins repeating after hold delay', () => {
      const onChange = vi.fn();
      const { result } = renderHook(() => useNumericInput({ value: 5, onChange }));

      act(() => {
        result.current.handlePressIn('increment');
      });

      act(() => void vi.advanceTimersByTime(499));
      expect(onChange).not.toHaveBeenCalled();

      act(() => void vi.advanceTimersByTime(1));
      expect(onChange).toHaveBeenCalledTimes(1);

      act(() => void vi.advanceTimersByTime(150));
      expect(onChange).toHaveBeenCalledTimes(2);
    });

    it('repeats with longPressStep when provided', () => {
      const onChange = vi.fn();
      const { result } = renderHook(() =>
        useNumericInput({ value: 5, onChange, step: 1, longPressStep: 10 })
      );

      act(() => {
        result.current.handlePressIn('increment');
      });

      act(() => void vi.advanceTimersByTime(500));
      expect(onChange).toHaveBeenCalledWith(15);
    });

    it('falls back to step when longPressStep omitted', () => {
      const onChange = vi.fn();
      const { result } = renderHook(() => useNumericInput({ value: 10, onChange, step: 5 }));

      act(() => {
        result.current.handlePressIn('increment');
      });

      act(() => void vi.advanceTimersByTime(500));
      expect(onChange).toHaveBeenCalledWith(15);
    });

    it('stops repeating on release', () => {
      const onChange = vi.fn();
      const { result } = renderHook(() => useNumericInput({ value: 5, onChange }));

      act(() => {
        result.current.handlePressIn('increment');
      });

      act(() => void vi.advanceTimersByTime(650));
      expect(onChange).toHaveBeenCalledTimes(2);

      act(() => {
        result.current.handlePressOut();
      });

      act(() => void vi.advanceTimersByTime(1000));
      expect(onChange).toHaveBeenCalledTimes(2);
    });
  });

  describe('clamping', () => {
    it('clamps to max on increment overshoot', () => {
      const onChange = vi.fn();
      const { result } = renderHook(() =>
        useNumericInput({ value: 9, onChange, step: 5, max: 10 })
      );

      act(() => {
        result.current.handlePressIn('increment');
        result.current.handlePressOut();
      });

      expect(onChange).toHaveBeenCalledWith(10);
    });

    it('clamps to min on decrement overshoot', () => {
      const onChange = vi.fn();
      const { result } = renderHook(() => useNumericInput({ value: 1, onChange, step: 5, min: 0 }));

      act(() => {
        result.current.handlePressIn('decrement');
        result.current.handlePressOut();
      });

      expect(onChange).toHaveBeenCalledWith(0);
    });
  });

  describe('decimal precision', () => {
    it('avoids floating point drift with fractional step', () => {
      const onChange = vi.fn();
      const { result } = renderHook(() => useNumericInput({ value: 0.2, onChange, step: 0.1 }));

      act(() => {
        result.current.handlePressIn('increment');
        result.current.handlePressOut();
      });

      expect(onChange).toHaveBeenCalledWith(0.3);
    });

    it('derives decimal places from step', () => {
      const { result } = renderHook(() =>
        useNumericInput({ value: 0, onChange: vi.fn(), step: 0.01 })
      );

      expect(result.current.decimals).toBe(2);
    });
  });

  describe('disabled', () => {
    it('cancels active long press when disabled', () => {
      const onChange = vi.fn();
      const { result, rerender } = renderHook(
        ({ disabled }) => useNumericInput({ value: 5, onChange, disabled }),
        { initialProps: { disabled: false } }
      );

      act(() => {
        result.current.handlePressIn('increment');
      });

      act(() => void vi.advanceTimersByTime(500));
      expect(onChange).toHaveBeenCalledTimes(1);

      rerender({ disabled: true });

      act(() => void vi.advanceTimersByTime(1000));
      expect(onChange).toHaveBeenCalledTimes(1);
    });

    it('ignores release after becoming disabled mid-press', () => {
      const onChange = vi.fn();
      const { result, rerender } = renderHook(
        ({ disabled }) => useNumericInput({ value: 5, onChange, disabled }),
        { initialProps: { disabled: false } }
      );

      act(() => {
        result.current.handlePressIn('increment');
      });

      rerender({ disabled: true });

      act(() => {
        result.current.handlePressOut();
      });

      expect(onChange).not.toHaveBeenCalled();
    });
  });

  describe('formatter', () => {
    it('uses default formatter when none provided', () => {
      const { result } = renderHook(() => useNumericInput({ value: 0, onChange: vi.fn() }));

      expect(result.current.formatter(1.5, 2)).toBe('1.50');
      expect(result.current.formatter(3)).toBe('3');
    });

    it('uses custom formatter when provided', () => {
      function formatter(v: number) {
        return `$${v}`;
      }
      const { result } = renderHook(() =>
        useNumericInput({ value: 0, onChange: vi.fn(), formatter })
      );

      expect(result.current.formatter(42)).toBe('$42');
    });
  });

  describe('cleanup', () => {
    it('clears all timers on unmount', () => {
      const onChange = vi.fn();
      const { result, unmount } = renderHook(() => useNumericInput({ value: 5, onChange }));

      act(() => {
        result.current.handlePressIn('increment');
      });

      act(() => void vi.advanceTimersByTime(500));
      expect(onChange).toHaveBeenCalledTimes(1);

      unmount();

      act(() => void vi.advanceTimersByTime(1000));
      expect(onChange).toHaveBeenCalledTimes(1);
    });
  });
});
