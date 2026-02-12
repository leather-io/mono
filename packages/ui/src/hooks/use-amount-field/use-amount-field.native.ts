import { type RefObject, useRef } from 'react';
import { type TextInput, type TextInputProps } from 'react-native';

import {
  type CurrencySign,
  type UseAmountFieldProps,
  useBaseAmountField,
} from './use-base-amount-field.shared';

type NativeInputProps = Pick<TextInputProps, 'value' | 'onChangeText' | 'keyboardType'>;

export interface UseAmountFieldResult {
  ref: RefObject<TextInput | null>;
  textInputProps: NativeInputProps;
  touched: boolean;
  currencySign?: CurrencySign;
}

export function useAmountField(options: UseAmountFieldProps): UseAmountFieldResult {
  const inputRef = useRef<TextInput>(null);

  const { displayValue, handleChange, touched, currencySign } = useBaseAmountField(options);

  function onChangeText(text: string) {
    const result = handleChange(text, text.length);

    if (!result.accepted && inputRef.current) {
      inputRef.current.setNativeProps({ text: result.displayValue });
    }
  }

  return {
    ref: inputRef,
    touched,
    currencySign,
    textInputProps: {
      value: displayValue,
      onChangeText,
      keyboardType: 'decimal-pad',
    },
  };
}

export { type CurrencySign, type UseAmountFieldProps };
