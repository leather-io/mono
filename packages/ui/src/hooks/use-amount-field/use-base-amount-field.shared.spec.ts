import { act, renderHook } from '@testing-library/react';
import { doNothing } from 'remeda';
import { describe, expect, it, vi } from 'vitest';

import {
  type ChangeResult,
  type CurrencySign,
  useBaseAmountField,
} from './use-base-amount-field.shared';

describe('useAmountField', () => {
  describe('display formatting', () => {
    it('returns 0 for empty value', () => {
      const { result } = renderHook(() =>
        useBaseAmountField({ value: '', onChange: doNothing, maxDecimals: 8 })
      );
      expect(result.current.displayValue).toBe('0');
    });
    it('formats integer with group separators', () => {
      const { result } = renderHook(() =>
        useBaseAmountField({ value: '12345', onChange: doNothing, maxDecimals: 8 })
      );
      expect(result.current.displayValue).toBe('12,345');
    });
    it('formats integer with decimal tail', () => {
      const { result } = renderHook(() =>
        useBaseAmountField({ value: '12345.9', onChange: doNothing, maxDecimals: 8 })
      );
      expect(result.current.displayValue).toBe('12,345.9');
    });
    it('preserves trailing decimal separator during input', () => {
      const { result } = renderHook(() =>
        useBaseAmountField({ value: '123.', onChange: doNothing, maxDecimals: 8 })
      );
      expect(result.current.displayValue).toBe('123.');
    });
    it('preserves trailing zeros in decimal portion', () => {
      const { result } = renderHook(() =>
        useBaseAmountField({ value: '1.50', onChange: doNothing, maxDecimals: 8 })
      );
      expect(result.current.displayValue).toBe('1.50');
    });
    it('omits group separators when enableGrouping is false', () => {
      const { result } = renderHook(() =>
        useBaseAmountField({
          value: '12345',
          onChange: doNothing,
          maxDecimals: 8,
          enableGrouping: false,
        })
      );
      expect(result.current.displayValue).toBe('12345');
    });
  });

  describe('character gating', () => {
    it('accepts single digit', () => {
      const { result } = renderHook(() =>
        useBaseAmountField({ value: '', onChange: doNothing, maxDecimals: 8 })
      );
      let change = {} as ChangeResult;
      act(() => {
        change = result.current.handleChange('5', 1);
      });
      expect(change.accepted).toBe(true);
      expect(change.displayValue).toBe('5');
    });

    it('accepts multiple digits', () => {
      const { result } = renderHook(() =>
        useBaseAmountField({ value: '12', onChange: doNothing, maxDecimals: 8 })
      );
      let change = {} as ChangeResult;
      act(() => {
        change = result.current.handleChange('123', 3);
      });
      expect(change.accepted).toBe(true);
      expect(change.displayValue).toBe('123');
    });
    it('rejects alphabetic characters', () => {
      const { result } = renderHook(() =>
        useBaseAmountField({ value: '12', onChange: doNothing, maxDecimals: 8 })
      );
      let change = {} as ChangeResult;
      act(() => {
        change = result.current.handleChange('12a', 3);
      });
      expect(change.accepted).toBe(false);
    });

    it('rejects special characters', () => {
      const { result } = renderHook(() =>
        useBaseAmountField({ value: '12', onChange: doNothing, maxDecimals: 8 })
      );
      let change = {} as ChangeResult;
      act(() => {
        change = result.current.handleChange('12@', 3);
      });
      expect(change.accepted).toBe(false);
    });

    it('rejects whitespace', () => {
      const { result } = renderHook(() =>
        useBaseAmountField({ value: '12', onChange: doNothing, maxDecimals: 8 })
      );
      let change = {} as ChangeResult;
      act(() => {
        change = result.current.handleChange('12 ', 3);
      });
      expect(change.accepted).toBe(false);
    });

    it('rejects user-typed group separator', () => {
      const { result } = renderHook(() =>
        useBaseAmountField({ value: '12', onChange: doNothing, maxDecimals: 8 })
      );
      let change = {} as ChangeResult;
      act(() => {
        change = result.current.handleChange('1,2', 2);
      });
      expect(change.accepted).toBe(false);
    });
    it('accepts valid digit typed into display that contains group separators', () => {
      const { result } = renderHook(() =>
        useBaseAmountField({ value: '1234', onChange: doNothing, maxDecimals: 8 })
      );
      let change = {} as ChangeResult;
      act(() => {
        change = result.current.handleChange('1,2345', 6);
      });
      expect(change.accepted).toBe(true);
      expect(change.displayValue).toBe('12,345');
    });
  });

  describe('decimal separator', () => {
    it('accepts a single decimal separator', () => {
      const { result } = renderHook(() =>
        useBaseAmountField({ value: '12', onChange: doNothing, maxDecimals: 8 })
      );
      let change = {} as ChangeResult;
      act(() => {
        change = result.current.handleChange('12.', 3);
      });
      expect(change.accepted).toBe(true);
      expect(change.displayValue).toBe('12.');
    });

    it('prepends 0 when input starts with decimal separator', () => {
      const { result } = renderHook(() =>
        useBaseAmountField({ value: '', onChange: doNothing, maxDecimals: 8 })
      );
      let change = {} as ChangeResult;
      act(() => {
        change = result.current.handleChange('.', 1);
      });
      expect(change.accepted).toBe(true);
      expect(change.displayValue).toBe('0.');
    });

    it('rejects a second decimal separator', () => {
      const { result } = renderHook(() =>
        useBaseAmountField({ value: '1.2', onChange: doNothing, maxDecimals: 8 })
      );
      let change = {} as ChangeResult;
      act(() => {
        change = result.current.handleChange('1.2.', 4);
      });
      expect(change.accepted).toBe(false);
    });
    it('enforces maxDecimals limit', () => {
      const { result } = renderHook(() =>
        useBaseAmountField({ value: '1.23', onChange: doNothing, maxDecimals: 2 })
      );
      let change = {} as ChangeResult;
      act(() => {
        change = result.current.handleChange('1.234', 5);
      });
      expect(change.accepted).toBe(false);
      expect(change.displayValue).toBe('1.23');
    });
    it('respects maxDecimals of 0 (integer only)', () => {
      const { result } = renderHook(() =>
        useBaseAmountField({ value: '5', onChange: doNothing, maxDecimals: 0 })
      );
      let change = {} as ChangeResult;
      act(() => {
        change = result.current.handleChange('5.', 2);
      });
      expect(change.accepted).toBe(false);
      expect(change.displayValue).toBe('5');
    });
  });

  describe('leading zeros', () => {
    it('accepts a single 0', () => {
      const { result } = renderHook(() =>
        useBaseAmountField({ value: '', onChange: doNothing, maxDecimals: 8 })
      );
      let change = {} as ChangeResult;
      act(() => {
        change = result.current.handleChange('0', 1);
      });
      expect(change.accepted).toBe(true);
      expect(change.displayValue).toBe('0');
    });

    it('rejects extra 0 when value is already 0', () => {
      const { result } = renderHook(() =>
        useBaseAmountField({ value: '0', onChange: doNothing, maxDecimals: 8 })
      );
      let change = {} as ChangeResult;
      act(() => {
        change = result.current.handleChange('00', 2);
      });
      expect(change.accepted).toBe(false);
      expect(change.displayValue).toBe('0');
    });
    it('accepts 0 followed by decimal separator', () => {
      const { result } = renderHook(() =>
        useBaseAmountField({ value: '0', onChange: doNothing, maxDecimals: 8 })
      );
      let change = {} as ChangeResult;
      act(() => {
        change = result.current.handleChange('0.', 2);
      });
      expect(change.accepted).toBe(true);
      expect(change.displayValue).toBe('0.');
    });

    it('auto-corrects 05 to 5', () => {
      const { result } = renderHook(() =>
        useBaseAmountField({ value: '0', onChange: doNothing, maxDecimals: 8 })
      );
      let change = {} as ChangeResult;
      act(() => {
        change = result.current.handleChange('05', 2);
      });
      expect(change.accepted).toBe(true);
      expect(change.displayValue).toBe('5');
    });

    it('auto-corrects 007 to 7', () => {
      const { result } = renderHook(() =>
        useBaseAmountField({ value: '0', onChange: doNothing, maxDecimals: 8 })
      );
      let change = {} as ChangeResult;
      act(() => {
        change = result.current.handleChange('007', 3);
      });
      expect(change.accepted).toBe(true);
      expect(change.displayValue).toBe('7');
    });
  });

  describe('clearing', () => {
    it('clears to 0 and calls onChange with 0', () => {
      const onChange = vi.fn();
      const { result } = renderHook(() =>
        useBaseAmountField({ value: '123', onChange, maxDecimals: 8 })
      );
      let change = {} as ChangeResult;
      act(() => {
        change = result.current.handleChange('', 0);
      });
      expect(change.accepted).toBe(true);
      expect(change.displayValue).toBe('0');
      expect(onChange).toHaveBeenCalledWith('0');
    });

    it('places cursor after 0 on clear', () => {
      const { result } = renderHook(() =>
        useBaseAmountField({ value: '123', onChange: doNothing, maxDecimals: 8 })
      );
      let change = {} as ChangeResult;
      act(() => {
        change = result.current.handleChange('', 0);
      });
      expect(change.cursorPosition).toBe(1);
    });
  });

  describe('no-op changes', () => {
    it('skips onChange when input resolves to current value', () => {
      const onChange = vi.fn();
      const { result } = renderHook(() =>
        useBaseAmountField({ value: '123', onChange, maxDecimals: 8 })
      );
      act(() => {
        result.current.handleChange('123', 3);
      });
      expect(onChange).not.toHaveBeenCalled();
    });

    it('skips onReject when input resolves to current value', () => {
      const onReject = vi.fn();
      const { result } = renderHook(() =>
        useBaseAmountField({ value: '123', onChange: doNothing, onReject, maxDecimals: 8 })
      );
      act(() => {
        result.current.handleChange('123', 3);
      });
      expect(onReject).not.toHaveBeenCalled();
    });
  });

  describe('rejection notifications', () => {
    it('calls onReject for invalid characters', () => {
      const onReject = vi.fn();
      const { result } = renderHook(() =>
        useBaseAmountField({ value: '12', onChange: doNothing, onReject, maxDecimals: 8 })
      );
      act(() => {
        result.current.handleChange('12a', 3);
      });
      expect(onReject).toHaveBeenCalledOnce();
    });
    it('calls onReject for second decimal separator', () => {
      const onReject = vi.fn();
      const { result } = renderHook(() =>
        useBaseAmountField({ value: '1.2', onChange: doNothing, onReject, maxDecimals: 8 })
      );
      act(() => {
        result.current.handleChange('1.2.', 4);
      });
      expect(onReject).toHaveBeenCalledOnce();
    });

    it('calls onReject for exceeding maxDecimals', () => {
      const onReject = vi.fn();
      const { result } = renderHook(() =>
        useBaseAmountField({ value: '1.23', onChange: doNothing, onReject, maxDecimals: 2 })
      );
      act(() => {
        result.current.handleChange('1.234', 5);
      });
      expect(onReject).toHaveBeenCalledOnce();
    });

    it('calls onReject for leading zero that corrects to current value', () => {
      const onReject = vi.fn();
      const { result } = renderHook(() =>
        useBaseAmountField({ value: '0', onChange: doNothing, onReject, maxDecimals: 8 })
      );
      act(() => {
        result.current.handleChange('00', 2);
      });
      expect(onReject).toHaveBeenCalledOnce();
    });

    it('calls onReject for user-typed group separator', () => {
      const onReject = vi.fn();
      const { result } = renderHook(() =>
        useBaseAmountField({ value: '12', onChange: doNothing, onReject, maxDecimals: 8 })
      );
      act(() => {
        result.current.handleChange('1,2', 2);
      });
      expect(onReject).toHaveBeenCalledOnce();
    });
    it('returns accepted: false with current displayValue on rejection', () => {
      const { result } = renderHook(() =>
        useBaseAmountField({ value: '1234', onChange: doNothing, maxDecimals: 8 })
      );
      let change = {} as ChangeResult;
      act(() => {
        change = result.current.handleChange('1,234a', 6);
      });
      expect(change.accepted).toBe(false);
      expect(change.displayValue).toBe('1,234');
    });
  });

  describe('onChange', () => {
    it('calls onChange with raw value (no group separators)', () => {
      const onChange = vi.fn();
      const { result } = renderHook(() =>
        useBaseAmountField({ value: '1234', onChange, maxDecimals: 8 })
      );
      act(() => {
        result.current.handleChange('1,2345', 6);
      });
      expect(onChange).toHaveBeenCalledWith('12345');
    });
    it('does not call onChange on rejection', () => {
      const onChange = vi.fn();
      const { result } = renderHook(() =>
        useBaseAmountField({ value: '12', onChange, maxDecimals: 8 })
      );
      act(() => {
        result.current.handleChange('12a', 3);
      });
      expect(onChange).not.toHaveBeenCalled();
    });
  });

  describe('cursor positioning', () => {
    it('places cursor after appended digit without grouping', () => {
      const { result } = renderHook(() =>
        useBaseAmountField({
          value: '12',
          onChange: doNothing,
          maxDecimals: 8,
          enableGrouping: false,
        })
      );
      let change = {} as ChangeResult;
      act(() => {
        change = result.current.handleChange('123', 3);
      });
      expect(change.cursorPosition).toBe(3);
    });
    it('places cursor after appended digit with grouping', () => {
      const { result } = renderHook(() =>
        useBaseAmountField({ value: '1234', onChange: doNothing, maxDecimals: 8 })
      );
      let change = {} as ChangeResult;
      act(() => {
        change = result.current.handleChange('1,2345', 6);
      });
      expect(change.cursorPosition).toBe(6);
    });
    it('adjusts cursor when group separator is introduced (e.g. 999 → 1,000)', () => {
      const { result } = renderHook(() =>
        useBaseAmountField({ value: '999', onChange: doNothing, maxDecimals: 8 })
      );
      let change = {} as ChangeResult;
      act(() => {
        change = result.current.handleChange('9999', 4);
      });
      expect(change.displayValue).toBe('9,999');
      expect(change.cursorPosition).toBe(5);
    });

    it('adjusts cursor when group separator is removed (e.g. 1,000 → 999)', () => {
      const { result } = renderHook(() =>
        useBaseAmountField({ value: '1000', onChange: doNothing, maxDecimals: 8 })
      );
      let change = {} as ChangeResult;
      act(() => {
        change = result.current.handleChange('1,00', 4);
      });
      expect(change.displayValue).toBe('100');
      expect(change.cursorPosition).toBe(3);
    });

    it('offsets cursor by 1 when leading zero is prepended for decimal', () => {
      const { result } = renderHook(() =>
        useBaseAmountField({ value: '', onChange: doNothing, maxDecimals: 8 })
      );
      let change = {} as ChangeResult;
      act(() => {
        change = result.current.handleChange('.', 1);
      });
      expect(change.displayValue).toBe('0.');
      expect(change.cursorPosition).toBe(2);
    });
    it('preserves cursor position when typing in the middle of the value', () => {
      const { result } = renderHook(() =>
        useBaseAmountField({ value: '13', onChange: doNothing, maxDecimals: 8 })
      );
      let change = {} as ChangeResult;
      act(() => {
        change = result.current.handleChange('123', 2);
      });
      expect(change.displayValue).toBe('123');
      expect(change.cursorPosition).toBe(2);
    });
    it('does not drift cursor forward on rejected mid-value input', () => {
      const { result } = renderHook(() =>
        useBaseAmountField({ value: '123', onChange: doNothing, maxDecimals: 8 })
      );
      let change = {} as ChangeResult;
      act(() => {
        change = result.current.handleChange('1a23', 2);
      });
      expect(change.accepted).toBe(false);
      expect(change.cursorPosition).toBe(1);
    });
  });

  describe('locale support', () => {
    it('uses period as decimal separator for en locale', () => {
      const { result } = renderHook(() =>
        useBaseAmountField({ value: '1', onChange: doNothing, maxDecimals: 8, locale: 'en' })
      );
      let change = {} as ChangeResult;
      act(() => {
        change = result.current.handleChange('1.', 2);
      });
      expect(change.accepted).toBe(true);
      expect(change.displayValue).toBe('1.');
    });
    it('uses comma as decimal separator for de locale', () => {
      const { result } = renderHook(() =>
        useBaseAmountField({ value: '1', onChange: doNothing, maxDecimals: 8, locale: 'de' })
      );
      let change = {} as ChangeResult;
      act(() => {
        change = result.current.handleChange('1,', 2);
      });
      expect(change.accepted).toBe(true);
      expect(change.displayValue).toBe('1,');
    });
    it('uses period as group separator for de locale', () => {
      const { result } = renderHook(() =>
        useBaseAmountField({ value: '12345', onChange: doNothing, maxDecimals: 8, locale: 'de' })
      );
      expect(result.current.displayValue).toBe('12.345');
    });
    it('rejects locale-inappropriate decimal separator in input', () => {
      const { result } = renderHook(() =>
        useBaseAmountField({ value: '1', onChange: doNothing, maxDecimals: 8, locale: 'de' })
      );
      let change = {} as ChangeResult;
      act(() => {
        change = result.current.handleChange('1.', 2);
      });
      expect(change.accepted).toBe(false);
    });
    it('defaults to en locale when not specified', () => {
      const { result } = renderHook(() =>
        useBaseAmountField({ value: '1', onChange: doNothing, maxDecimals: 8 })
      );
      let change = {} as ChangeResult;
      act(() => {
        change = result.current.handleChange('1.', 2);
      });
      expect(change.accepted).toBe(true);
      expect(change.displayValue).toBe('1.');
    });
  });

  describe('touched', () => {
    it('starts false on initial render', () => {
      const { result } = renderHook(() =>
        useBaseAmountField({ value: '0', onChange: doNothing, maxDecimals: 8 })
      );
      expect(result.current.touched).toBe(false);
    });

    it('becomes true after rejected change', () => {
      const { result } = renderHook(() =>
        useBaseAmountField({ value: '12', onChange: doNothing, maxDecimals: 8 })
      );
      act(() => {
        result.current.handleChange('12a', 3);
      });
      expect(result.current.touched).toBe(true);
    });

    it('becomes true after accepted change', () => {
      const { result } = renderHook(() =>
        useBaseAmountField({ value: '12', onChange: doNothing, maxDecimals: 8 })
      );
      act(() => {
        result.current.handleChange('123', 3);
      });
      expect(result.current.touched).toBe(true);
    });
  });

  describe('currencySign', () => {
    it('is undefined when no currency prop is passed', () => {
      const { result } = renderHook(() =>
        useBaseAmountField({ value: '0', onChange: doNothing, maxDecimals: 8 })
      );
      expect(result.current.currencySign).toBeUndefined();
    });

    it('returns $ prefix for USD in en locale', () => {
      const { result } = renderHook(() =>
        useBaseAmountField({
          value: '0',
          onChange: doNothing,
          maxDecimals: 2,
          locale: 'en',
          currency: 'USD',
        })
      );
      expect(result.current.currencySign).toEqual({
        symbol: '$',
        placement: 'prefix',
      } satisfies CurrencySign);
    });

    it('returns € suffix for EUR in de locale', () => {
      const { result } = renderHook(() =>
        useBaseAmountField({
          value: '0',
          onChange: doNothing,
          maxDecimals: 2,
          locale: 'de',
          currency: 'EUR',
        })
      );
      expect(result.current.currencySign).toEqual({
        symbol: '€',
        placement: 'suffix',
      } satisfies CurrencySign);
    });
  });

  describe('enableGrouping', () => {
    it('groups by default when enableGrouping is not specified', () => {
      const { result } = renderHook(() =>
        useBaseAmountField({ value: '12345', onChange: doNothing, maxDecimals: 8 })
      );
      expect(result.current.displayValue).toBe('12,345');
    });
    it('display value includes group separators when enabled', () => {
      const { result } = renderHook(() =>
        useBaseAmountField({
          value: '12345',
          onChange: doNothing,
          maxDecimals: 8,
          enableGrouping: true,
        })
      );
      expect(result.current.displayValue).toBe('12,345');
    });

    it('display value has no group separators when disabled', () => {
      const { result } = renderHook(() =>
        useBaseAmountField({
          value: '12345',
          onChange: doNothing,
          maxDecimals: 8,
          enableGrouping: false,
        })
      );
      expect(result.current.displayValue).toBe('12345');
    });

    it('raw value passed to onChange is identical regardless of grouping', () => {
      const onChangeGrouped = vi.fn();
      const onChangeUngrouped = vi.fn();
      const { result: grouped } = renderHook(() =>
        useBaseAmountField({
          value: '1234',
          onChange: onChangeGrouped,
          maxDecimals: 8,
          enableGrouping: true,
        })
      );
      const { result: ungrouped } = renderHook(() =>
        useBaseAmountField({
          value: '1234',
          onChange: onChangeUngrouped,
          maxDecimals: 8,
          enableGrouping: false,
        })
      );
      act(() => {
        grouped.current.handleChange('1,2345', 6);
        ungrouped.current.handleChange('12345', 5);
      });
      expect(onChangeGrouped).toHaveBeenCalledWith('12345');
      expect(onChangeUngrouped).toHaveBeenCalledWith('12345');
    });
  });
});
