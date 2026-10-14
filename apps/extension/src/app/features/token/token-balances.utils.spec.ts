import { createBtcBalance, createMoney } from '@leather.io/utils';

import { getBtcBalanceEntries } from './token-balances.utils';

function btcBalance(total: number, locked = 0, inbound = 0) {
  return createBtcBalance(
    createMoney(total, 'BTC'),
    createMoney(inbound, 'BTC'),
    undefined,
    undefined,
    undefined,
    createMoney(locked, 'BTC')
  );
}

function quoteBalance(total: number, locked = 0, inbound = 0) {
  return createBtcBalance(
    createMoney(total, 'USD'),
    createMoney(inbound, 'USD'),
    undefined,
    undefined,
    undefined,
    createMoney(locked, 'USD')
  );
}

describe(getBtcBalanceEntries.name, () => {
  it('always lists the available balance, even at zero', () => {
    const entries = getBtcBalanceEntries({ btc: btcBalance(0), quote: quoteBalance(0) }, vi.fn());
    expect(entries.map(entry => entry.title)).toEqual(['Available to transfer']);
  });

  it('hides categories without a balance', () => {
    const entries = getBtcBalanceEntries(
      { btc: btcBalance(500_000, 200_000), quote: quoteBalance(300, 120) },
      vi.fn()
    );
    expect(entries.map(entry => entry.title)).toEqual(['Available to transfer', 'In a bond']);
    expect(entries[1].amount.amount.toNumber()).toEqual(200_000);
    expect(entries[1].fiatAmount?.amount.toNumber()).toEqual(120);
  });

  it('reports the category when a row is pressed', () => {
    const onSelectCategory = vi.fn();
    const entries = getBtcBalanceEntries(
      { btc: btcBalance(500_000, 0, 10_000), quote: quoteBalance(300, 0, 6) },
      onSelectCategory
    );
    entries[1].onPressRow?.();
    expect(onSelectCategory).toHaveBeenCalledWith('pending');
  });
});
