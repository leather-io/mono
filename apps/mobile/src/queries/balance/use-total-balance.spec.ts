import { useStxBalance } from '@/queries/balance/stacks-balance.query';
import { vi } from 'vitest';

import { useCryptoCurrencyMarketDataMeanAverage } from '@leather.io/query';
import { createMoney } from '@leather.io/utils';

import { useAccountTotalBalance, useWalletTotalBalance } from './use-total-balance';

// Mock the dependencies
vi.mock('./stacks-balance.query');
vi.mock('@leather.io/query');

describe('useWalletTotalBalance', () => {
  beforeEach(() => {
    (useStxBalance as jest.Mock).mockReturnValue({
      stxBalance: createMoney(1000000, 'STX'),
    });
    (useCryptoCurrencyMarketDataMeanAverage as jest.Mock).mockImplementation(currency => {
      if (currency === 'STX') return 0.5;
      if (currency === 'BTC') return 30000;
      return 0;
    });
  });

  it('should calculate total balance correctly', () => {
    const result = useWalletTotalBalance();

    expect(result.stxBalance).toEqual(createMoney(1000000, 'STX'));
    expect(result.btcBalance).toEqual(createMoney(0, 'BTC'));
    expect(result.stxBalanceUsd).toEqual(createMoney(500, 'USD'));
    expect(result.btcBalanceUsd).toEqual(createMoney(0, 'USD'));
    expect(result.totalBalance).toEqual(createMoney(500, 'USD'));
  });

  it('should call useStxBalance with the provided accounts', () => {
    useWalletTotalBalance();
    expect(useStxBalance).toHaveBeenCalledWith();
  });

  it('should handle zero balances correctly', () => {
    (useStxBalance as jest.Mock).mockReturnValue({
      stxBalance: createMoney(0, 'STX'),
    });

    const result = useWalletTotalBalance();

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
    (useStxBalance as jest.Mock).mockReturnValue({
      stxBalance: createMoney(1000000, 'STX'),
    });
    (useCryptoCurrencyMarketDataMeanAverage as jest.Mock).mockImplementation(currency => {
      if (currency === 'STX') return 0.5;
      if (currency === 'BTC') return 30000;
      return 0;
    });
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
    (useStxBalance as jest.Mock).mockReturnValue({
      stxBalance: createMoney(0, 'STX'),
    });

    const result = useAccountTotalBalance(accountId);

    expect(result.stxBalance).toEqual(createMoney(0, 'STX'));
    expect(result.btcBalance).toEqual(createMoney(0, 'BTC'));
    expect(result.stxBalanceUsd).toEqual(createMoney(0, 'USD'));
    expect(result.btcBalanceUsd).toEqual(createMoney(0, 'USD'));
    expect(result.totalBalance).toEqual(createMoney(0, 'USD'));
  });
});
