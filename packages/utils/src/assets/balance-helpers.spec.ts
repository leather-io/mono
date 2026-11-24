import { createMoney } from '../money';
import { aggregateBtcBalances, createBtcBalance } from './balance-helpers';

const oneBtc = createMoney(100_000_000, 'BTC');
const twoBtc = createMoney(200_000_000, 'BTC');
const threeBtc = createMoney(300_000_000, 'BTC');
const dust = createMoney(1_200, 'BTC');

describe(createBtcBalance.name, () => {
  test('defaults locked balance to zero', () => {
    const balance = createBtcBalance(oneBtc);
    expect(balance.lockedBalance.amount.toString()).toEqual('0');
    expect(balance.totalBalance.amount.toString()).toEqual('100000000');
    expect(balance.availableBalance.amount.toString()).toEqual('100000000');
  });

  test('keeps total balance as given when locked balance is set', () => {
    const balance = createBtcBalance(threeBtc, undefined, undefined, undefined, undefined, twoBtc);
    expect(balance.totalBalance.amount.toString()).toEqual('300000000');
    expect(balance.lockedBalance.amount.toString()).toEqual('200000000');
  });

  test('excludes locked and unspendable balances from available balance', () => {
    const balance = createBtcBalance(threeBtc, undefined, undefined, dust, dust, twoBtc);
    expect(balance.availableBalance.amount.toString()).toEqual('99998800');
  });
});

describe(aggregateBtcBalances.name, () => {
  test('sums total and locked balances across accounts', () => {
    const aggregate = aggregateBtcBalances([
      createBtcBalance(threeBtc, undefined, undefined, undefined, undefined, twoBtc),
      createBtcBalance(twoBtc, undefined, undefined, undefined, undefined, oneBtc),
    ]);
    expect(aggregate.totalBalance.amount.toString()).toEqual('500000000');
    expect(aggregate.lockedBalance.amount.toString()).toEqual('300000000');
    expect(aggregate.availableBalance.amount.toString()).toEqual('200000000');
  });
});
