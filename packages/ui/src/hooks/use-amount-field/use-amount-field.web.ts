import {
  type ChangeEvent,
  type InputHTMLAttributes,
  type RefObject,
  useLayoutEffect,
  useRef,
} from 'react';

import {
  type CurrencySign,
  type UseAmountFieldProps,
  useBaseAmountField,
} from './use-base-amount-field.shared';

type InputProps = Pick<
  InputHTMLAttributes<HTMLInputElement>,
  'value' | 'onChange' | 'type' | 'inputMode'
>;

interface UseAmountFieldResult {
  ref: RefObject<HTMLInputElement | null>;
  inputProps: InputProps;
  touched: boolean;
  currencySign?: CurrencySign;
}

export function useAmountField(props: UseAmountFieldProps): UseAmountFieldResult {
  const inputRef = useRef<HTMLInputElement>(null);
  const cursorRef = useRef<number | null>(null);

  const { displayValue, handleChange, touched, currencySign } = useBaseAmountField(props);

  useLayoutEffect(() => {
    if (cursorRef.current !== null && inputRef.current) {
      inputRef.current.setSelectionRange(cursorRef.current, cursorRef.current);
      cursorRef.current = null;
    }
  });

  function onChange(e: ChangeEvent<HTMLInputElement>) {
    const result = handleChange(e.target.value, e.target.selectionStart ?? 0);

    if (result.accepted) {
      cursorRef.current = result.cursorPosition;
    } else {
      e.target.value = result.displayValue;
      e.target.setSelectionRange(result.cursorPosition, result.cursorPosition);
    }
  }

  return {
    ref: inputRef,
    touched,
    currencySign,
    inputProps: {
      type: 'text',
      inputMode: 'decimal',
      value: displayValue,
      onChange,
    },
  };
}

export { type CurrencySign, type UseAmountFieldProps };
