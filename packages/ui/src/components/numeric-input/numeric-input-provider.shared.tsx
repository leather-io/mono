import { ReactNode, createContext, useContext } from 'react';

import {
  type NumericInputState,
  type UseNumericInputProps,
  useNumericInput,
} from './use-numeric-input.shared';

const NumericInputContext = createContext<NumericInputState | null>(null);

export interface NumericInputProviderProps extends UseNumericInputProps {
  children: ReactNode;
}

export function NumericInputProvider({ children, ...props }: NumericInputProviderProps) {
  const state = useNumericInput(props);
  return <NumericInputContext.Provider value={state}>{children}</NumericInputContext.Provider>;
}

export function useNumericInputContext(): NumericInputState {
  const context = useContext(NumericInputContext);
  if (!context) {
    throw new Error('NumericInput components must be used within NumericInput');
  }
  return context;
}
