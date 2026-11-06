import { describe, expect, test } from 'vitest';

import { type ActivityListBalance, activityListSummary } from './activity-list-fixtures';

function balance(
  symbol: string,
  direction: ActivityListBalance['direction'] = 'in'
): ActivityListBalance {
  return { symbol, direction, amount: '1', fiat: '$1.00' };
}

describe(activityListSummary.name, () => {
  test.each([
    ['BTC', 'STX'],
    ['STX', 'sBTC'],
    ['sBTC', 'USDCx'],
    ['USDCx', 'ALEX'],
  ])('prioritizes %s over %s regardless of input order', (first, second) => {
    expect(
      activityListSummary({ state: 'confirmed', balances: [balance(second), balance(first)] })
    ).toEqual({
      amount: `+1 ${first}`,
      caption: `+1 ${second}`,
      direction: 'in',
    });
  });

  test('puts received assets above spent assets even when the spent asset has higher priority', () => {
    expect(
      activityListSummary({
        state: 'confirmed',
        balances: [balance('STX', 'out'), balance('sBTC')],
      })
    ).toEqual({
      amount: '+1 sBTC',
      caption: '−1 STX',
      direction: 'in',
    });
  });

  test('shows fiat for a single spend', () => {
    expect(activityListSummary({ state: 'confirmed', balances: [balance('STX', 'out')] })).toEqual({
      amount: '−1 STX',
      caption: '$1.00',
      direction: 'out',
    });
  });

  test('uses a count for three or more assets without changing the source balances', () => {
    const balances = [balance('USDCx'), balance('sBTC'), balance('STX')];
    expect(activityListSummary({ state: 'confirmed', balances })).toEqual({
      amount: '+1 STX',
      caption: '+2 more',
      direction: 'in',
    });
    expect(balances.map(item => item.symbol)).toEqual(['USDCx', 'sBTC', 'STX']);
  });

  test.each<{ state: 'pending' | 'failed' }>([{ state: 'pending' }, { state: 'failed' }])(
    'never shows a balance summary for $state',
    ({ state }) => {
      expect(activityListSummary({ state, balances: [balance('STX', 'out')] })).toBeUndefined();
    }
  );
});
