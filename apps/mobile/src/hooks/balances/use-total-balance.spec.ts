import { MockedAccount } from '@/mocks/account.mocks';

import { useCryptoCurrencyMarketDataMeanAverage } from '@leather.io/query';
import { createMoney } from '@leather.io/utils';

import { useStxBalance } from './use-stx-balances';
import { useTotalBalance } from './use-total-balance';

// Mock the dependencies
jest.mock('./use-stx-balances');
jest.mock('@leather.io/query');

describe('useTotalBalance', () => {
  const mockAccounts: MockedAccount[] = [
    { id: '1', name: 'Account 1' },
    { id: '2', name: 'Account 2' },
  ] as MockedAccount[];

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
    const result = useTotalBalance(mockAccounts);

    expect(result.stxBalance).toEqual(createMoney(1000000, 'STX'));
    expect(result.btcBalance).toEqual(createMoney(0, 'BTC'));
    expect(result.stxBalanceUsd).toEqual(createMoney(500, 'USD'));
    expect(result.btcBalanceUsd).toEqual(createMoney(0, 'USD'));
    expect(result.totalBalance).toEqual(createMoney(500, 'USD'));
  });

  it('should call useStxBalance with the provided accounts', () => {
    useTotalBalance(mockAccounts);
    expect(useStxBalance).toHaveBeenCalledWith(mockAccounts);
  });

  it('should use correct market data for STX and BTC', () => {
    useTotalBalance(mockAccounts);
    expect(useCryptoCurrencyMarketDataMeanAverage).toHaveBeenCalledWith('STX');
    expect(useCryptoCurrencyMarketDataMeanAverage).toHaveBeenCalledWith('BTC');
  });

  it('should handle zero balances correctly', () => {
    (useStxBalance as jest.Mock).mockReturnValue({
      stxBalance: createMoney(0, 'STX'),
    });

    const result = useTotalBalance(mockAccounts);

    expect(result.stxBalance).toEqual(createMoney(0, 'STX'));
    expect(result.btcBalance).toEqual(createMoney(0, 'BTC'));
    expect(result.stxBalanceUsd).toEqual(createMoney(0, 'USD'));
    expect(result.btcBalanceUsd).toEqual(createMoney(0, 'USD'));
    expect(result.totalBalance).toEqual(createMoney(0, 'USD'));
  });
});
