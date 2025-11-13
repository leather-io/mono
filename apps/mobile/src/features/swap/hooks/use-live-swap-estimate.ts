import { UseQueryResult } from '@tanstack/react-query';

import {
  EnrichedSwapQuote,
  NetworkFee,
  SwapQuoteSelectionResult,
} from '../swap-state/swap-state.types';

export type LiveSwapEstimate =
  | {
      status: 'idle';
    }
  | {
      status: 'loading';
      refetch(): Promise<void>;
    }
  | {
      status: 'error';
      error: Error;
      refetch(): Promise<void>;
    }
  | {
      status: 'empty';
      refetch(): Promise<void>;
    }
  | {
      status: 'success';
      quotes: EnrichedSwapQuote[];
      selectedQuote: EnrichedSwapQuote;
      networkFee: NetworkFee;
      isRefetching: boolean;
      refetch(): Promise<void>;
    };

interface UseLiveSwapEstimateProps {
  quoteQuery: UseQueryResult<SwapQuoteSelectionResult, Error>;
  networkFeeQuery: UseQueryResult<NetworkFee, Error>;
}

export function useLiveSwapEstimate({
  quoteQuery,
  networkFeeQuery,
}: UseLiveSwapEstimateProps): LiveSwapEstimate {
  const isFetching = quoteQuery.isFetching || networkFeeQuery.isFetching;
  const isPending = quoteQuery.isPending || networkFeeQuery.isPending;
  const isError = quoteQuery.isError || networkFeeQuery.isError;
  const isSuccess = quoteQuery.isSuccess && networkFeeQuery.isSuccess;

  async function refetch() {
    await quoteQuery.refetch();
    await networkFeeQuery.refetch();
  }

  if (isPending && !isFetching) {
    return { status: 'idle' };
  }

  if (isPending) {
    return { status: 'loading', refetch };
  }

  if (isError) {
    return {
      status: 'error',
      error: quoteQuery.error ?? (networkFeeQuery.error as Error),
      refetch,
    };
  }

  if (isSuccess) {
    if (!quoteQuery.data.selected) {
      return { status: 'empty', refetch };
    }

    return {
      status: 'success',
      selectedQuote: quoteQuery.data.selected,
      quotes: quoteQuery.data.quotes,
      networkFee: networkFeeQuery.data,
      isRefetching: quoteQuery.isRefetching || networkFeeQuery.isRefetching,
      refetch,
    };
  }

  return {
    status: 'error',
    error: new Error("Failed to retrieve swap estimate. This is likely a bug in 'useSwapEstimate'"),
    refetch,
  };
}
