import { createContext, useContext, useRef, useState } from 'react';

import BigNumber from 'bignumber.js';

import { HIGH_FEE_AMOUNT_STX } from '@leather.io/constants';

import type { HasChildren } from '@app/common/has-children';

interface StacksHighFeeWarningContext {
  showHighFeeWarningSheet: boolean;
  setShowHighFeeWarningSheet(val: boolean): void;
  hasBypassedFeeWarning: boolean;
  setHasBypassedFeeWarning(val: boolean): void;
  shouldWarnAboutHighFee(fee: number | string): boolean;
}

const stacksHighFeeWarningContext = createContext<StacksHighFeeWarningContext | null>(null);

export function useStacksHighFeeWarningContext() {
  const ctx = useContext(stacksHighFeeWarningContext);
  if (!ctx) throw new Error(`stacksCommonSendFormContext must be used within a context`);
  return ctx;
}

const StacksHighFeeWarningProvider = stacksHighFeeWarningContext.Provider;

export function StacksHighFeeWarningContainer({ children }: HasChildren) {
  const [showHighFeeWarningSheet, setShowHighFeeWarningSheet] = useState(false);
  const [hasBypassedFeeWarning, setHasBypassedFeeWarningState] = useState(false);
  const hasBypassedFeeWarningRef = useRef(false);

  function setHasBypassedFeeWarning(val: boolean) {
    hasBypassedFeeWarningRef.current = val;
    setHasBypassedFeeWarningState(val);
  }

  function shouldWarnAboutHighFee(fee: number | string) {
    if (hasBypassedFeeWarningRef.current) return false;
    return new BigNumber(fee).isGreaterThan(HIGH_FEE_AMOUNT_STX);
  }

  return (
    <StacksHighFeeWarningProvider
      value={{
        showHighFeeWarningSheet,
        setShowHighFeeWarningSheet,
        hasBypassedFeeWarning,
        setHasBypassedFeeWarning,
        shouldWarnAboutHighFee,
      }}
    >
      {children}
    </StacksHighFeeWarningProvider>
  );
}
