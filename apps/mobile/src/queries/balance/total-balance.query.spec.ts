import { useStxBalance } from '@/queries/balance/stacks-balance.query';
import { vi } from 'vitest';

import { CryptoCurrency, createMarketPair } from '@leather.io/models';
import { useCryptoCurrencyMarketDataMeanAverage } from '@leather.io/query';
import { createMoney } from '@leather.io/utils';

import { useAccountTotalBalance, useTotalBalance } from './total-balance.query';

// Mock the dependencies
vi.mock('./stacks-balance.query');
vi.mock('@leather.io/query');

function getPrice(currency: CryptoCurrency) {
  if (currency === 'STX') return 0.5;
  if (currency === 'BTC') return 30000;
  return 0;
}

describe('useTotalBalance', () => {
  beforeEach(() => {
    vi.mocked(useStxBalance).mockReturnValue({
      availableBalance: createMoney(1000000, 'STX'),
      fiatBalance: createMoney(500, 'USD'),
    });
    vi.mocked(useCryptoCurrencyMarketDataMeanAverage).mockImplementation(currency => ({
      price: createMoney(getPrice(currency), currency),
      percentChange24h: 0,
      pair: createMarketPair(currency, 'USD'),
    }));
  });

  it('should calculate total balance correctly', () => {
    const result = useTotalBalance();

    expect(result.stxBalance).toEqual(createMoney(1000000, 'STX'));
    expect(result.btcBalance).toEqual(createMoney(0, 'BTC'));
    expect(result.stxBalanceUsd).toEqual(createMoney(500, 'USD'));
    expect(result.btcBalanceUsd).toEqual(createMoney(0, 'USD'));
    expect(result.totalBalance).toEqual(createMoney(500, 'USD'));
  });

  it('should call useStxBalance with the provided accounts', () => {
    useTotalBalance();
    expect(useStxBalance).toHaveBeenCalledWith();
  });

  it('should handle zero balances correctly', () => {
    vi.mocked(useStxBalance).mockReturnValue({
      availableBalance: createMoney(0, 'STX'),
      fiatBalance: createMoney(0, 'USD'),
    });

    const result = useTotalBalance();

    expect(result.stxBalance).toEqual(createMoney(0, 'STX'));
    expect(result.btcBalance).toEqual(createMoney(0, 'BTC'));
    expect(result.stxBalanceUsd).toEqual(createMoney(0, 'USD'));
    expect(result.btcBalanceUsd).toEqual(createMoney(0, 'USD'));
    expect(result.totalBalance).toEqual(createMoney(0, 'USD'));
  });
});

describe('useAccountTotalBalance', () => {
  const accountId = { fingerprint: '123', accountIndex: 0 };
  beforeEach(() => {
    vi.mocked(useStxBalance).mockReturnValue({
      availableBalance: createMoney(1000000, 'STX'),
      fiatBalance: createMoney(0, 'USD'),
    });

    vi.mocked(useCryptoCurrencyMarketDataMeanAverage).mockImplementation(currency => ({
      price: createMoney(getPrice(currency), currency),
      percentChange24h: 0,
      pair: createMarketPair(currency, 'USD'),
    }));
  });

  it('should calculate total balance correctly', () => {
    const result = useAccountTotalBalance(accountId);

    expect(result.stxBalance).toEqual(createMoney(1000000, 'STX'));
    expect(result.btcBalance).toEqual(createMoney(0, 'BTC'));
    expect(result.stxBalanceUsd).toEqual(createMoney(500, 'USD'));
    expect(result.btcBalanceUsd).toEqual(createMoney(0, 'USD'));
    expect(result.totalBalance).toEqual(createMoney(500, 'USD'));
  });

  it('should call useStxBalance with the provided accounts', () => {
    useAccountTotalBalance(accountId);
    expect(useStxBalance).toHaveBeenCalledWith(accountId);
  });

  it('should handle zero balances correctly', () => {
    vi.mocked(useStxBalance).mockReturnValue({
      availableBalance: createMoney(0, 'STX'),
      fiatBalance: createMoney(0, 'USD'),
    });

    const result = useAccountTotalBalance(accountId);

    expect(result.stxBalance).toEqual(createMoney(0, 'STX'));
    expect(result.btcBalance).toEqual(createMoney(0, 'BTC'));
    expect(result.stxBalanceUsd).toEqual(createMoney(0, 'USD'));
    expect(result.btcBalanceUsd).toEqual(createMoney(0, 'USD'));
    expect(result.totalBalance).toEqual(createMoney(0, 'USD'));
  });
});
