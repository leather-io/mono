import { InputCurrencyMode } from '@/utils/types';

export function whenInputCurrencyMode<TValue>(mode: InputCurrencyMode) {
  return <TMode extends Record<InputCurrencyMode, TValue>>(
    modes: TMode
  ): TMode[InputCurrencyMode] => modes[mode];
}
