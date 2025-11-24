import { createContext, useContext } from 'react';

export interface NumericInputContextValue {
  value: number;
  decimals: number;
  min: number;
  max: number;
  disabled?: boolean;
  formatter(value: number, decimals?: number): string;
  handlePressIn(direction: 'increment' | 'decrement'): void;
  handlePressOut(): void;
}

export const NumericInputContext = createContext<NumericInputContextValue | null>(null);

export function useNumericInputContext(): NumericInputContextValue {
  const context = useContext(NumericInputContext);
  if (!context) {
    throw new Error('NumericInput components must be used within NumericInput');
  }
  return context;
}
