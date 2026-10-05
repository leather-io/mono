import { describe, expect, it } from 'vitest';

import { matchesSip10SearchTerm } from './search-sip10-balances';

const usdh = { name: 'Hermetica USDh', symbol: 'USDh' };

describe('matchesSip10SearchTerm', () => {
  it('matches everything for an empty or whitespace term', () => {
    expect(matchesSip10SearchTerm(usdh, '')).toBe(true);
    expect(matchesSip10SearchTerm(usdh, '   ')).toBe(true);
  });

  it('matches name and symbol case-insensitively', () => {
    expect(matchesSip10SearchTerm(usdh, 'herm')).toBe(true);
    expect(matchesSip10SearchTerm(usdh, 'USDH')).toBe(true);
    expect(matchesSip10SearchTerm(usdh, ' usdh ')).toBe(true);
  });

  it('rejects terms that match neither', () => {
    expect(matchesSip10SearchTerm(usdh, 'welsh')).toBe(false);
  });
});
