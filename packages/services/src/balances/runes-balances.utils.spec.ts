import { BisRuneValidOutput } from '../infrastructure/api/best-in-slot/best-in-slot-api.client';
import { parseRunesOutputsBalances } from './runes-balances.utils';

describe('parseRunesOutputsBalances', () => {
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

    const parsedBalances = parseRunesOutputsBalances(outputs);

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

    const parsedBalances = parseRunesOutputsBalances(outputs);

    expect(parsedBalances[runeName1]).toEqual('0');
    expect(parsedBalances[runeName2]).toEqual('300000000');
  });
});
