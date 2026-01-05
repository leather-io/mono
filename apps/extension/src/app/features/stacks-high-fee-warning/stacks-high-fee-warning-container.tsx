import { createContext, useContext, useState } from 'react';

import { useQuery } from '@tanstack/react-query';
import BigNumber from 'bignumber.js';
import type { FormikErrors } from 'formik';

import { LEATHER_API_URL_PRODUCTION, LEATHER_API_URL_STAGING } from '@leather.io/constants';
import { isEmpty, microStxToStx } from '@leather.io/utils';

import { IS_DEV_ENV, IS_TEST_ENV } from '@shared/environment';

import type { HasChildren } from '@app/common/has-children';

interface StacksFeeConfig {
  globalMaximumFee: number; // µSTX
}

async function fetchStacksFeeConfig(signal?: AbortSignal): Promise<StacksFeeConfig> {
  const baseUrl = IS_DEV_ENV || IS_TEST_ENV ? LEATHER_API_URL_STAGING : LEATHER_API_URL_PRODUCTION;
  const resp = await fetch(`${baseUrl}/v1/app-config`, { signal });
  if (!resp.ok) throw new Error(`Failed to fetch app-config: ${resp.status}`);
  const data = (await resp.json()) as { fees?: { stacks?: StacksFeeConfig } };
  if (!data?.fees?.stacks) throw new Error('App-config missing fees.stacks');
  return data.fees.stacks;
}

interface StacksHighFeeWarningContext {
  showHighFeeWarningSheet: boolean;
  setShowHighFeeWarningSheet(val: boolean): void;
  hasBypassedFeeWarning: boolean;
  setHasBypassedFeeWarning(val: boolean): void;
  isHighFeeWithNoFormErrors(errors: FormikErrors<unknown>, fee: number | string): boolean;
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
  const [hasBypassedFeeWarning, setHasBypassedFeeWarning] = useState(false);

  const { data: stacksFeeConfig } = useQuery({
    queryKey: ['stacks-fee-config'],
    queryFn: async ({ signal }) => await fetchStacksFeeConfig(signal),
    staleTime: 1000 * 60 * 10,
  });

  // `globalMaximumFee` is provided in µSTX (fractional unit)
  const highFeeThresholdStx = microStxToStx(stacksFeeConfig?.globalMaximumFee ?? 5_000_000);

  function isHighFeeWithNoFormErrors(errors: FormikErrors<unknown>, fee: number | string) {
    if (hasBypassedFeeWarning) return false;
    return isEmpty(errors) && new BigNumber(fee).isGreaterThanOrEqualTo(highFeeThresholdStx);
  }

  return (
    <StacksHighFeeWarningProvider
      value={{
        showHighFeeWarningSheet,
        setShowHighFeeWarningSheet,
        hasBypassedFeeWarning,
        setHasBypassedFeeWarning,
        isHighFeeWithNoFormErrors,
      }}
    >
      {children}
    </StacksHighFeeWarningProvider>
  );
}
