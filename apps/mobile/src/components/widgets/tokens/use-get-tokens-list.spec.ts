import { useTotalBalance } from '@/features/accounts/balances/hooks/use-total-balance';
import { AccountStore } from '@/store/accounts/utils';
import { Mock, beforeEach, describe, expect, it, vi } from 'vitest';

import { createMoney } from '@leather.io/utils';

import { Token } from './types';
import { useGetTokensList } from './use-get-tokens-list';

// Mock the useTotalBalance hook
vi.mock('@/hooks/balances/use-total-balance');

describe('useGetTokensList', () => {
  const mockAccounts: AccountStore[] = [
    {
      id: '1',
      name: 'Account 1',
      icon: 'icon',
      status: 'active',
      fingerprint: 'fingerprint',
      accountIndex: 0,
    },
  ];

  const mockBalances = {
    btcBalance: createMoney(100000, 'BTC'),
    btcBalanceUsd: createMoney(5000, 'USD'),
    stxBalance: createMoney(1000000, 'STX'),
    stxBalanceUsd: createMoney(1000, 'USD'),
  };

  beforeEach(() => {
    (useTotalBalance as unknown as Mock).mockReturnValue(mockBalances);
  });

  it('should return an array of tokens', () => {
    const result = useGetTokensList(mockAccounts);

    expect(result).toHaveLength(2);
    expect(useTotalBalance).toHaveBeenCalledWith(mockAccounts);
  });

  it('should return Stacks token with correct properties', () => {
    const result = useGetTokensList(mockAccounts);

    const stxToken = result.find((token: Token) => token.ticker === 'stx');
    expect(stxToken).toBeDefined();
    expect(stxToken?.chain).toBe('Stacks blockchain');
    expect(stxToken?.availableBalance.availableBalance).toEqual(mockBalances.stxBalance);
    expect(stxToken?.fiatBalance).toEqual(mockBalances.stxBalanceUsd);
    expect(stxToken?.tokenName).toBe('Stacks');
  });

  it('should return Bitcoin token with correct properties', () => {
    const result = useGetTokensList(mockAccounts);

    const btcToken = result.find((token: Token) => token.ticker === 'btc');
    expect(btcToken).toBeDefined();
    expect(btcToken?.chain).toBe('Bitcoin');
    expect(btcToken?.availableBalance.availableBalance).toEqual(mockBalances.btcBalance);
    expect(btcToken?.fiatBalance).toEqual(mockBalances.btcBalanceUsd);
    expect(btcToken?.tokenName).toBe('Bitcoin');
  });
});
