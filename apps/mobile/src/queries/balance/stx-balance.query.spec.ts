import { useStxBalance } from '@/queries/balance/stx-balance.query';
import { vi } from 'vitest';

import { createMoney } from '@leather.io/utils';

vi.mock('@leather.io/query');

describe('useStxBalance', () => {
  const mockAddresses: string[] = ['1', '2'];

  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('should return zero STX balance when no accounts are provided', () => {
    const result = useStxBalance([]);
    expect(result.availableBalance).toEqual(createMoney(0, 'STX'));
  });

  it('should sum up STX balances from all accounts', () => {
    vi.spyOn(require('@leather.io/query'), 'useStxAddressBalance').mockImplementation(address => {
      if (address === mockAddresses[0]) return createMoney(1000000, 'STX');
      if (address === mockAddresses[1]) return createMoney(2000000, 'STX');
      return createMoney(0, 'STX');
    });

    const result = useStxBalance(mockAddresses);
    expect(result.availableBalance).toEqual(createMoney(3000000, 'STX'));
  });

  it('should handle accounts with zero balance', () => {
    vi.spyOn(require('@leather.io/query'), 'useStxAddressBalance').mockImplementation(address => {
      if (!address) return createMoney(0, 'STX');
      if (address === mockAddresses[0]) return createMoney(1000000, 'STX');
      return createMoney(0, 'STX');
    });

    const result = useStxBalance(mockAddresses);
    expect(result.availableBalance).toEqual(createMoney(1000000, 'STX'));
  });

  it('should call useStxAddressBalance for each account', () => {
    const useStxAddressBalanceMock = vi.spyOn(require('@leather.io/query'), 'useStxAddressBalance');
    useStxAddressBalanceMock.mockReturnValue(createMoney(0, 'STX'));

    useStxBalance(mockAddresses);

    expect(useStxAddressBalanceMock).toHaveBeenCalledTimes(mockAddresses.length);
    mockAddresses.forEach(address => {
      expect(useStxAddressBalanceMock).toHaveBeenCalledWith(address);
    });
  });
});
