import { createMoney } from '@leather.io/utils';

import { Sip10AddressBalance, Sip10Balance } from './sip10-balances.service';
import { combineSip10Balances } from './sip10-balances.utils';

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

const mockSip10AssetBalance: Sip10Balance = {
  asset: {
    category: 'fungible',
    name: 'Test Token',
    symbol: 'TEST',
    decimals: 6,
    assetId: 'SP000...TEST',
    contractId: 'SP000...TEST',
    chain: 'stacks',
    protocol: 'sip10',
    canTransfer: true,
    imageCanonicalUri: '',
    hasMemo: false,
  },
  crypto: mockBaseCryptoAssetBalance,
  fiat: mockBaseCryptoAssetBalance,
};

const mockAddressBalances: Sip10AddressBalance[] = [
  {
    address: 'SP000...TEST',
    sip10s: [
      {
        ...mockSip10AssetBalance,
      },
    ],
    fiat: mockBaseCryptoAssetBalance,
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
    fiat: mockBaseCryptoAssetBalance,
  },
];

describe('combineSip10Balances', () => {
  it('should combine balances from multiple addresses', () => {
    const result = combineSip10Balances(mockAddressBalances);

    expect(result.length).toBe(1);
    expect(result[0].asset.symbol).toBe('TEST');
    expect(result[0].crypto.totalBalance.amount.toNumber()).toBe(150);
    expect(result[0].crypto.inboundBalance.amount.toNumber()).toBe(15);
    expect(result[0].crypto.outboundBalance.amount.toNumber()).toBe(7);
    expect(result[0].crypto.pendingBalance.amount.toNumber()).toBe(158);
    expect(result[0].crypto.availableBalance.amount.toNumber()).toBe(143);
    expect(result[0].fiat.totalBalance.amount.toNumber()).toBe(200);
  });

  it('should handle empty address balances', () => {
    const result = combineSip10Balances([]);
    expect(result).toEqual([]);
  });

  it('should handle multiple different tokens', () => {
    const otherToken = {
      ...mockSip10AssetBalance,
      asset: {
        ...mockSip10AssetBalance.asset,
        symbol: 'OTHER',
      },
    } as Sip10Balance;

    const addressBalances = [
      {
        sip10s: [mockSip10AssetBalance, otherToken],
      },
      {
        sip10s: [mockSip10AssetBalance],
      },
    ];

    const result = combineSip10Balances(addressBalances as Sip10AddressBalance[]);

    expect(result.length).toBe(2);
    expect(result[0].asset.symbol).toBe('TEST');
    expect(result[1].asset.symbol).toBe('OTHER');
    expect(result[0].crypto.totalBalance.amount.toNumber()).toBe(200);
    expect(result[1].crypto.totalBalance.amount.toNumber()).toBe(100);
  });
});
