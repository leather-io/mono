import { AccountAddresses } from '@leather.io/models';
import { createMoney } from '@leather.io/utils';

import { BisRuneValidOutput } from '../infrastructure/api/best-in-slot/best-in-slot-api.client';
import { RuneBalance, RunesAccountBalance } from './runes-balances.service';
import { combineRunesBalances, readRunesOutputsBalances } from './runes-balances.utils';

describe('readRunesOutputsBalances', () => {
  const runeName1 = 'SOME•RUNE•1';
  const runeName2 = 'SOME•RUNE•2';

  it('should calculate total output balances by rune name', () => {
    const outputs = [
      {
        balances: ['100000000'],
        rune_names: [runeName1],
      },
      {
        balances: ['300000000', '100000000'],
        rune_names: [runeName2, runeName1],
      },
    ] as BisRuneValidOutput[];

    const parsedBalances = readRunesOutputsBalances(outputs);

    expect(parsedBalances[runeName1]).toEqual('200000000');
    expect(parsedBalances[runeName2]).toEqual('300000000');
  });

  it('should handle empty balances and rune_names arrays', () => {
    const outputs = [
      {
        balances: [],
        rune_names: [runeName1],
      },
      {
        balances: ['300000000', '100000000'],
        rune_names: [runeName2],
      },
      {
        balances: ['500000000'],
        rune_names: [],
      },
    ] as unknown as BisRuneValidOutput[];

    const parsedBalances = readRunesOutputsBalances(outputs);

    expect(parsedBalances[runeName1]).toEqual('0');
    expect(parsedBalances[runeName2]).toEqual('300000000');
  });
});

const mockRuneBalance = {
  totalBalance: createMoney(100, 'USD'),
  inboundBalance: createMoney(10, 'USD'),
  outboundBalance: createMoney(5, 'USD'),
  pendingBalance: createMoney(105, 'USD'),
  availableBalance: createMoney(95, 'USD'),
};

const mockRuneBalance2 = {
  totalBalance: createMoney(50, 'USD'),
  inboundBalance: createMoney(5, 'USD'),
  outboundBalance: createMoney(2, 'USD'),
  pendingBalance: createMoney(53, 'USD'),
  availableBalance: createMoney(48, 'USD'),
};

const mockAccountAddresses: AccountAddresses = {
  id: {
    fingerprint: 'abcdefg',
    accountIndex: 0,
  },
  bitcoin: {
    nativeSegwitDescriptor: 'ns-descriptor',
    taprootDescriptor: 'tr-descriptor',
  },
};

const mockRuneAssetBalance: RuneBalance = {
  asset: {
    category: 'fungible',
    chain: 'bitcoin',
    protocol: 'rune',
    symbol: '👽',
    runeName: 'TEST',
    spacedRuneName: 'TE•ST',
    decimals: 6,
    hasMemo: false,
  },
  crypto: mockRuneBalance,
  quote: mockRuneBalance,
};

const mockAccountBalances: RunesAccountBalance[] = [
  {
    account: mockAccountAddresses,
    runes: [
      {
        ...mockRuneAssetBalance,
      },
    ],
    quote: mockRuneBalance,
  },
  {
    account: mockAccountAddresses,
    runes: [
      {
        ...mockRuneAssetBalance,
        crypto: {
          ...mockRuneBalance2,
        },
      },
    ],
    quote: mockRuneBalance,
  },
];

describe('combineRunesBalances', () => {
  it('should combine Rune balances from multiple accounts', () => {
    const result = combineRunesBalances(mockAccountBalances);

    expect(result.length).toBe(1);
    expect(result[0].asset.runeName).toBe('TEST');
    expect(result[0].crypto.totalBalance.amount.toNumber()).toBe(150);
    expect(result[0].crypto.inboundBalance.amount.toNumber()).toBe(15);
    expect(result[0].crypto.outboundBalance.amount.toNumber()).toBe(7);
    expect(result[0].crypto.pendingBalance.amount.toNumber()).toBe(158);
    expect(result[0].crypto.availableBalance.amount.toNumber()).toBe(143);
    expect(result[0].quote.totalBalance.amount.toNumber()).toBe(200);
  });

  it('should handle empty address balances', () => {
    const result = combineRunesBalances([]);
    expect(result).toEqual([]);
  });

  it('should handle multiple different tokens', () => {
    const otherToken = {
      ...mockRuneAssetBalance,
      asset: {
        ...mockRuneAssetBalance.asset,
        runeName: 'OTHER',
      },
    } as RuneBalance;

    const accountBalances = [
      {
        runes: [mockRuneAssetBalance, otherToken],
      },
      {
        runes: [mockRuneAssetBalance],
      },
    ];

    const result = combineRunesBalances(accountBalances as RunesAccountBalance[]);

    expect(result.length).toBe(2);
    expect(result[0].asset.runeName).toBe('TEST');
    expect(result[1].asset.runeName).toBe('OTHER');
    expect(result[0].crypto.totalBalance.amount.toNumber()).toBe(200);
    expect(result[1].crypto.totalBalance.amount.toNumber()).toBe(100);
  });
});
