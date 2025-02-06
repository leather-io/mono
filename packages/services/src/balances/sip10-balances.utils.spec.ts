import { createMoney } from '@leather.io/utils';

import { Sip10AddressBalance, Sip10AssetBalance } from './sip10-balances.service';
import { aggregateSip10AddressBalances } from './sip10-balances.utils';

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
  crypto: mockBaseCryptoAssetBalance,
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
        crypto: {
          ...mockBaseCryptoAssetBalance2,
        },
      },
    ],
    usd: mockBaseCryptoAssetBalance,
  },
];

describe('aggregateSip10AssetBalances', () => {
  it('should aggregate balances from multiple addresses', () => {
    const result = aggregateSip10AddressBalances(mockAddressBalances);

    expect(result.length).toBe(1);
    expect(result[0].asset.symbol).toBe('TEST');
    expect(result[0].crypto.totalBalance.amount.toNumber()).toBe(150);
    expect(result[0].crypto.inboundBalance.amount.toNumber()).toBe(15);
    expect(result[0].crypto.outboundBalance.amount.toNumber()).toBe(7);
    expect(result[0].crypto.pendingBalance.amount.toNumber()).toBe(158);
    expect(result[0].crypto.availableBalance.amount.toNumber()).toBe(143);
    expect(result[0].usd.totalBalance.amount.toNumber()).toBe(200);
  });

  it('should handle empty address balances', () => {
    const result = aggregateSip10AddressBalances([]);
    expect(result).toEqual([]);
  });

  it('should handle multiple different tokens', () => {
    const otherToken = {
      ...mockSip10AssetBalance,
      asset: {
        ...mockSip10AssetBalance.asset,
        symbol: 'OTHER',
      },
    } as Sip10AssetBalance;

    const addressBalances = [
      {
        sip10s: [mockSip10AssetBalance, otherToken],
      },
      {
        sip10s: [mockSip10AssetBalance],
      },
    ];

    const result = aggregateSip10AddressBalances(addressBalances as Sip10AddressBalance[]);

    expect(result.length).toBe(2);
    expect(result[0].asset.symbol).toBe('TEST');
    expect(result[1].asset.symbol).toBe('OTHER');
    expect(result[0].crypto.totalBalance.amount.toNumber()).toBe(200);
    expect(result[1].crypto.totalBalance.amount.toNumber()).toBe(100);
  });
});
