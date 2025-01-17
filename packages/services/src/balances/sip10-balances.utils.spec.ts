import { createMoney } from '@leather.io/utils';

import { Sip10AddressBalance, Sip10AssetBalance } from './sip10-balances.service';
import { getAggregateSip10Balances, sumBalances } from './sip10-balances.utils';

const mockBaseCryptoAssetBalance = {
  totalBalance: createMoney(100, 'USD'),
  inboundBalance: createMoney(10, 'USD'),
  outboundBalance: createMoney(5, 'USD'),
  pendingBalance: createMoney(105, 'USD'),
  availableBalance: createMoney(95, 'USD'),
};

const mockBaseCryptoAssetBalance2 = {
  totalBalance: createMoney(50, 'USD'),
  inboundBalance: createMoney(5, 'USD'),
  outboundBalance: createMoney(2, 'USD'),
  pendingBalance: createMoney(53, 'USD'),
  availableBalance: createMoney(48, 'USD'),
};

const mockSip10AssetBalance: Sip10AssetBalance = {
  asset: {
    category: 'fungible',
    name: 'Test Token',
    symbol: 'TEST',
    decimals: 6,
    contractId: 'SP000...TEST',
    chain: 'stacks',
    protocol: 'sip10',
    canTransfer: true,
    imageCanonicalUri: '',
    hasMemo: false,
  },
  sip10: mockBaseCryptoAssetBalance,
  usd: mockBaseCryptoAssetBalance,
};

const mockAddressBalances: Sip10AddressBalance[] = [
  {
    address: 'SP000...TEST',
    sip10s: [
      {
        ...mockSip10AssetBalance,
      },
    ],
    usd: mockBaseCryptoAssetBalance,
  },
  {
    address: 'SP001...TEST',
    sip10s: [
      {
        ...mockSip10AssetBalance,
        sip10: {
          ...mockBaseCryptoAssetBalance2,
        },
      },
    ],
    usd: mockBaseCryptoAssetBalance,
  },
];

describe('sumBalances', () => {
  it('should correctly sum two balances', () => {
    const initialBalance = mockBaseCryptoAssetBalance;
    const accumulatedBalance = {
      ...mockBaseCryptoAssetBalance2,
    };

    const result = sumBalances({ initialBalance, accumulatedBalance });

    expect(result.totalBalance.amount.toNumber()).toBe(150);
    expect(result.inboundBalance.amount.toNumber()).toBe(15);
    expect(result.outboundBalance.amount.toNumber()).toBe(7);
    expect(result.pendingBalance.amount.toNumber()).toBe(158);
    expect(result.availableBalance.amount.toNumber()).toBe(143);
  });
});

describe('getAggregateSip10Balances', () => {
  it('should aggregate balances from multiple addresses', () => {
    const result = getAggregateSip10Balances(mockAddressBalances);

    expect(result.length).toBe(1);
    expect(result[0].asset.symbol).toBe('TEST');
    expect(result[0].sip10.totalBalance.amount.toNumber()).toBe(150);
    expect(result[0].sip10.inboundBalance.amount.toNumber()).toBe(15);
    expect(result[0].sip10.outboundBalance.amount.toNumber()).toBe(7);
    expect(result[0].sip10.pendingBalance.amount.toNumber()).toBe(158);
    expect(result[0].sip10.availableBalance.amount.toNumber()).toBe(143);
    expect(result[0].usd.totalBalance.amount.toNumber()).toBe(200);
  });

  it('should handle empty address balances', () => {
    const result = getAggregateSip10Balances([]);
    expect(result).toEqual([]);
  });

  it('should handle multiple different tokens', () => {
    const otherToken = {
      ...mockSip10AssetBalance,
      asset: {
        ...mockSip10AssetBalance.asset,
        symbol: 'OTHER',
      },
    };

    const addressBalances = [
      {
        sip10s: [mockSip10AssetBalance, otherToken],
      },
      {
        sip10s: [mockSip10AssetBalance],
      },
    ];

    const result = getAggregateSip10Balances(addressBalances);

    expect(result.length).toBe(2);
    expect(result[0].asset.symbol).toBe('TEST');
    expect(result[1].asset.symbol).toBe('OTHER');
    expect(result[0].sip10.totalBalance.amount.toNumber()).toBe(200);
    expect(result[1].sip10.totalBalance.amount.toNumber()).toBe(100);
  });
});
