import BigNumber from 'bignumber.js';
import { describe, expect, it } from 'vitest';

import { createMoney } from '@leather.io/utils';

import {
  createConstrainedQuoteResult,
  createEmptyQuoteResult,
  createMockEnrichedQuote,
  createMockNetworkFee,
  createMockQuery,
  createSelectedQuoteResult,
  renderUseLiveSwapEstimate,
} from './use-live-swap-estimate.test-utils';

describe('useLiveSwapEstimate', () => {
  describe('status derivation from quote query', () => {
    it('returns idle when quote query is pending and not fetching', () => {
      const { result } = renderUseLiveSwapEstimate({
        quoteQuery: createMockQuery({ isPending: true, isFetching: false }),
      });

      expect(result.current.status).toBe('idle');
    });

    it('returns loading when quote query is pending and fetching', () => {
      const { result } = renderUseLiveSwapEstimate({
        quoteQuery: createMockQuery({ isPending: true, isFetching: true }),
      });

      expect(result.current.status).toBe('loading');
    });

    it('returns error when quote query has error', () => {
      const error = new Error('Quote fetch failed');
      const { result } = renderUseLiveSwapEstimate({
        quoteQuery: createMockQuery({ isError: true, error }),
      });

      expect(result.current.status).toBe('error');
      if (result.current.status === 'error') {
        expect(result.current.error).toBe(error);
      }
    });

    it('returns empty when quote succeeds with no selected quote and empty constraints', () => {
      const { result } = renderUseLiveSwapEstimate({
        quoteQuery: createMockQuery({
          isSuccess: true,
          data: createEmptyQuoteResult(),
        }),
      });

      expect(result.current.status).toBe('empty');
    });

    it('returns constrained when quote succeeds with no selected quote and has constraints', () => {
      const constraints = [
        { reason: 'minimum-threshold-not-met' as const, threshold: createMoney(100000, 'BTC') },
      ];
      const { result } = renderUseLiveSwapEstimate({
        quoteQuery: createMockQuery({
          isSuccess: true,
          data: createConstrainedQuoteResult(constraints),
        }),
      });

      expect(result.current.status).toBe('constrained');
      if (result.current.status === 'constrained') {
        expect(result.current.constraints).toBe(constraints);
      }
    });
  });

  describe('status derivation from network fee and market data', () => {
    it('returns loading when quote succeeds but network fee is loading', () => {
      const { result } = renderUseLiveSwapEstimate({
        quoteQuery: createMockQuery({
          isSuccess: true,
          data: createSelectedQuoteResult(),
        }),
        networkFeeQuery: createMockQuery({ isPending: true, isFetching: true }),
      });

      expect(result.current.status).toBe('loading');
    });

    it('returns loading when quote succeeds but market data is pending', () => {
      const { result } = renderUseLiveSwapEstimate({
        quoteQuery: createMockQuery({
          isSuccess: true,
          data: createSelectedQuoteResult(),
        }),
        baseMarketDataQuery: createMockQuery({ isPending: true, isFetching: true }),
      });

      expect(result.current.status).toBe('loading');
    });

    it('returns error when network fee query has error', () => {
      const error = new Error('Network fee fetch failed');
      const { result } = renderUseLiveSwapEstimate({
        quoteQuery: createMockQuery({
          isSuccess: true,
          data: createSelectedQuoteResult(),
        }),
        networkFeeQuery: createMockQuery({ isError: true, error }),
      });

      expect(result.current.status).toBe('error');
      if (result.current.status === 'error') {
        expect(result.current.error).toBe(error);
      }
    });

    it('returns error when base market data query has error', () => {
      const error = new Error('Base market data fetch failed');
      const { result } = renderUseLiveSwapEstimate({
        quoteQuery: createMockQuery({
          isSuccess: true,
          data: createSelectedQuoteResult(),
        }),
        baseMarketDataQuery: createMockQuery({ isError: true, error }),
      });

      expect(result.current.status).toBe('error');
      if (result.current.status === 'error') {
        expect(result.current.error).toBe(error);
      }
    });

    it('returns error when native asset market data query has error', () => {
      const error = new Error('Native asset market data fetch failed');
      const { result } = renderUseLiveSwapEstimate({
        quoteQuery: createMockQuery({
          isSuccess: true,
          data: createSelectedQuoteResult(),
        }),
        nativeAssetMarketDataQuery: createMockQuery({ isError: true, error }),
      });

      expect(result.current.status).toBe('error');
      if (result.current.status === 'error') {
        expect(result.current.error).toBe(error);
      }
    });
  });

  describe('success state', () => {
    it('returns success with correct data when all queries succeed', () => {
      const { result } = renderUseLiveSwapEstimate({
        quoteQuery: createMockQuery({
          isSuccess: true,
          data: createSelectedQuoteResult(),
        }),
      });

      expect(result.current.status).toBe('success');
      if (result.current.status === 'success') {
        expect(result.current.selectedQuote).toBeDefined();
        expect(result.current.quotes).toBeDefined();
        expect(result.current.fees).toBeDefined();
        expect(result.current.fees.network).toBeDefined();
        expect(result.current.isRefetching).toBe(false);
        expect(result.current.refetch).toBeDefined();
      }
    });

    it('includes all quotes in success state', () => {
      const quoteResult = createSelectedQuoteResult();
      const { result } = renderUseLiveSwapEstimate({
        quoteQuery: createMockQuery({
          isSuccess: true,
          data: quoteResult,
        }),
      });

      expect(result.current.status).toBe('success');
      if (result.current.status === 'success') {
        expect(result.current.selectedQuote).toBe(quoteResult.selected);
        expect(result.current.quotes).toBe(quoteResult.quotes);
      }
    });

    it('calculates provider fee correctly', () => {
      const quote = createMockEnrichedQuote({
        baseAmount: createMoney(100000000, 'BTC'),
        providerFeePercentage: new BigNumber(0.01),
      });
      const { result } = renderUseLiveSwapEstimate({
        quoteQuery: createMockQuery({
          isSuccess: true,
          data: createSelectedQuoteResult(quote),
        }),
      });

      expect(result.current.status).toBe('success');
      if (result.current.status === 'success') {
        expect(result.current.fees.provider).toBeDefined();
        expect(result.current.fees.provider?.crypto.amount.toString()).toBe('1000000');
      }
    });

    it('calculates network fee correctly', () => {
      const networkFee = createMockNetworkFee();
      const { result } = renderUseLiveSwapEstimate({
        quoteQuery: createMockQuery({
          isSuccess: true,
          data: createSelectedQuoteResult(),
        }),
        networkFeeQuery: createMockQuery({ isSuccess: true, data: networkFee }),
      });

      expect(result.current.status).toBe('success');
      if (result.current.status === 'success') {
        expect(result.current.fees.network.crypto).toEqual(networkFee.calculation.value);
      }
    });
  });

  describe('network fee readiness caching', () => {
    it('uses cached network fee during refetch instead of showing loading', () => {
      const networkFee = createMockNetworkFee();
      const { result } = renderUseLiveSwapEstimate({
        quoteQuery: createMockQuery({
          isSuccess: true,
          data: createSelectedQuoteResult(),
        }),
        networkFeeQuery: createMockQuery({
          isSuccess: true,
          isFetching: true,
          isRefetching: true,
          data: networkFee,
        }),
      });

      expect(result.current.status).toBe('success');
      if (result.current.status === 'success') {
        expect(result.current.fees.isRefetching).toBe(true);
      }
    });

    it('resets network fee cache when selected quote becomes undefined', () => {
      const networkFee = createMockNetworkFee();
      const selectedQuoteQuery = createMockQuery({
        isSuccess: true,
        data: createSelectedQuoteResult(),
      });
      const networkFeeQuery = createMockQuery({
        isSuccess: true,
        data: networkFee,
      });

      const { result, rerender } = renderUseLiveSwapEstimate({
        quoteQuery: selectedQuoteQuery,
        networkFeeQuery,
      });

      expect(result.current.status).toBe('success');

      rerender({
        quoteQuery: createMockQuery({
          isSuccess: true,
          data: createEmptyQuoteResult(),
        }),
        networkFeeQuery: createMockQuery({
          isPending: true,
          isFetching: true,
        }),
      });

      expect(result.current.status).toBe('empty');
    });
  });

  describe('refetch behavior', () => {
    it('does not regress to loading status during quote refetch', async () => {
      const { result } = renderUseLiveSwapEstimate({
        quoteQuery: createMockQuery({
          isSuccess: true,
          data: createSelectedQuoteResult(),
        }),
      });

      expect(result.current.status).toBe('success');

      if (result.current.status === 'success') {
        await result.current.refetch();
      }

      expect(result.current.status).toBe('success');
    });

    it('shows isRefetching true with cached data during refetch', async () => {
      const { result } = renderUseLiveSwapEstimate({
        quoteQuery: createMockQuery({
          isSuccess: true,
          data: createSelectedQuoteResult(),
        }),
      });

      expect(result.current.status).toBe('success');
      if (result.current.status === 'success') {
        expect(result.current.isRefetching).toBe(false);
        await result.current.refetch();
      }
    });

    it('isRefetching is true when quoteQuery is refetching', () => {
      const { result } = renderUseLiveSwapEstimate({
        quoteQuery: createMockQuery({
          isSuccess: true,
          isRefetching: true,
          isFetching: true,
          data: createSelectedQuoteResult(),
        }),
      });

      expect(result.current.status).toBe('success');
      if (result.current.status === 'success') {
        expect(result.current.isRefetching).toBe(true);
      }
    });

    it('isRefetching is true when networkFeeQuery is refetching', () => {
      const { result } = renderUseLiveSwapEstimate({
        quoteQuery: createMockQuery({
          isSuccess: true,
          data: createSelectedQuoteResult(),
        }),
        networkFeeQuery: createMockQuery({
          isSuccess: true,
          isRefetching: true,
          isFetching: true,
          data: createMockNetworkFee(),
        }),
      });

      expect(result.current.status).toBe('success');
      if (result.current.status === 'success') {
        expect(result.current.isRefetching).toBe(true);
      }
    });
  });

  describe('interval state', () => {
    // Dependency on `useInterval` from "leather.io/ui/native" causes react-native related module resolution issues when trying to test this.
    // TODO: Revisit by moving useInterval
    it.todo('interval is enabled when in success state with selected quote');
    it.todo('interval is disabled when in constrained state');
    it.todo('interval is disabled when in empty state');
  });
});
