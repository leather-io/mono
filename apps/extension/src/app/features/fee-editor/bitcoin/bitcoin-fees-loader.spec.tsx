import { renderToString } from 'react-dom/server';

import { BitcoinError } from '@leather.io/bitcoin';
import type { BitcoinTransactionFeeQuote, TransactionFees } from '@leather.io/models';
import type { AccountRequest } from '@leather.io/services';
import { createMoney } from '@leather.io/utils';

import { BitcoinFeesLoader } from './bitcoin-fees-loader';

const useBitcoinTransactionFeesMock = vi.fn();

vi.mock('@app/query/bitcoin/fees/bitcoin-transaction-fees.hooks', () => ({
  useBitcoinTransactionFees: () => useBitcoinTransactionFeesMock(),
}));

function makeFeeQuote(rate: number): BitcoinTransactionFeeQuote {
  return {
    type: 'bitcoinFeeRate',
    rate,
    rateUnit: 'sats/vB',
    estimatedTxSize: 140,
    sizeUnit: 'vB',
    value: createMoney(140 * rate, 'BTC'),
  };
}

const feeRates: TransactionFees<BitcoinTransactionFeeQuote> = {
  chain: 'bitcoin',
  options: {
    low: makeFeeQuote(1),
    standard: makeFeeQuote(2),
    high: makeFeeQuote(3),
  },
};

const account: AccountRequest = {
  account: { id: { fingerprint: 'testFingerprint', accountIndex: 0 } },
};

function renderLoader() {
  return renderToString(
    <BitcoinFeesLoader
      account={account}
      loadingFallback={<span>loading-fallback</span>}
      recipients={[]}
      utxos={[]}
    >
      {({ fees, feesError }) => (
        <span>{`fees-content rate:${fees.standard.feeRate} error:${feesError ?? 'none'}`}</span>
      )}
    </BitcoinFeesLoader>
  );
}

describe(BitcoinFeesLoader.name, () => {
  test('renders children with the insufficient funds error without throwing when coin selection fails', () => {
    useBitcoinTransactionFeesMock.mockReturnValue({
      data: undefined,
      isLoading: false,
      error: new BitcoinError('InsufficientFunds'),
    });

    const html = renderLoader();

    expect(html).toContain('error:insufficient-funds');
    expect(html).toContain('rate:0');
  });

  test('renders children with the insufficient funds error even when stale fees exist', () => {
    useBitcoinTransactionFeesMock.mockReturnValue({
      data: feeRates,
      isLoading: false,
      error: new BitcoinError('InsufficientFunds'),
    });

    const html = renderLoader();

    expect(html).toContain('error:insufficient-funds');
    expect(html).toContain('rate:2');
  });

  test('renders children with the estimation error when fees fail for another reason', () => {
    useBitcoinTransactionFeesMock.mockReturnValue({
      data: undefined,
      isLoading: false,
      error: new Error('Network request failed'),
    });

    const html = renderLoader();

    expect(html).toContain('error:fee-estimation-failed');
    expect(html).toContain('rate:0');
  });

  test('renders children without an error when stale fees exist alongside a generic refetch error', () => {
    useBitcoinTransactionFeesMock.mockReturnValue({
      data: feeRates,
      isLoading: false,
      error: new Error('Network request failed'),
    });

    const html = renderLoader();

    expect(html).toContain('error:none');
    expect(html).toContain('rate:2');
  });

  test('renders the loading fallback while fees load', () => {
    useBitcoinTransactionFeesMock.mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
    });

    const html = renderLoader();

    expect(html).toContain('loading-fallback');
    expect(html).not.toContain('fees-content');
  });

  test('renders children when fees are loaded', () => {
    useBitcoinTransactionFeesMock.mockReturnValue({
      data: feeRates,
      isLoading: false,
      error: null,
    });

    const html = renderLoader();

    expect(html).toContain('error:none');
    expect(html).toContain('rate:2');
    expect(html).not.toContain('loading-fallback');
  });
});
