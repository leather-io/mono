import { AccountStore } from '@/store/accounts/utils';

import { createMoney } from '@leather.io/utils';

import { useStxBalance } from './use-stx-balances';

// Mock the dependencies
jest.mock('@leather.io/query');

describe('useStxBalance', () => {
  const mockAccounts: AccountStore[] = [
    { id: '1', name: 'Account 1', icon: 'icon', status: 'active' },
    { id: '2', name: 'Account 2', icon: 'icon', status: 'active' },
  ];

  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('should return zero STX balance when no accounts are provided', () => {
    const result = useStxBalance([]);
    expect(result.stxBalance).toEqual(createMoney(0, 'STX'));
  });

  it('should sum up STX balances from all accounts', () => {
    jest.spyOn(require('@leather.io/query'), 'useStxAddressBalance').mockImplementation(address => {
      if (address === mockAccounts[0]?.id) return createMoney(1000000, 'STX');
      if (address === mockAccounts[1]?.id) return createMoney(2000000, 'STX');
      return createMoney(0, 'STX');
    });

    const result = useStxBalance(mockAccounts);
    expect(result.stxBalance).toEqual(createMoney(3000000, 'STX'));
  });

  it('should handle accounts with zero balance', () => {
    jest.spyOn(require('@leather.io/query'), 'useStxAddressBalance').mockImplementation(address => {
      if (!address) return createMoney(0, 'STX');
      if (address === mockAccounts[0]?.id) return createMoney(1000000, 'STX');
      return createMoney(0, 'STX');
    });

    const result = useStxBalance(mockAccounts);
    expect(result.stxBalance).toEqual(createMoney(1000000, 'STX'));
  });

  it('should call useStxAddressBalance for each account', () => {
    const useStxAddressBalanceMock = jest.spyOn(
      require('@leather.io/query'),
      'useStxAddressBalance'
    );
    useStxAddressBalanceMock.mockReturnValue(createMoney(0, 'STX'));

    useStxBalance(mockAccounts);

    expect(useStxAddressBalanceMock).toHaveBeenCalledTimes(mockAccounts.length);
    mockAccounts.forEach(account => {
      expect(useStxAddressBalanceMock).toHaveBeenCalledWith(account.id);
    });
  });
});
