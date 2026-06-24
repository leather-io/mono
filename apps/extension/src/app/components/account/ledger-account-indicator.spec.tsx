import { renderToString } from 'react-dom/server';

import { AccountSelectors } from '@tests/selectors/account.selectors';

import { getLedgerAccountIndicator } from './ledger-account-indicator';

vi.mock('@leather.io/ui', () => ({
  LedgerIcon: () => <svg data-testid="ledger-icon" />,
}));

describe('getLedgerAccountIndicator', () => {
  test('returns no indicator for software wallets', () => {
    expect(getLedgerAccountIndicator('software', AccountSelectors.LedgerIndicator)).toBeUndefined();
  });

  test('returns no indicator when the wallet type is unknown', () => {
    expect(getLedgerAccountIndicator(undefined, AccountSelectors.LedgerIndicator)).toBeUndefined();
  });

  test('renders a labelled indicator for ledger wallets', () => {
    const indicator = getLedgerAccountIndicator('ledger', AccountSelectors.LedgerIndicator);
    if (!indicator) throw new Error('expected a ledger indicator element');

    const html = renderToString(indicator);

    expect(html).toContain(AccountSelectors.LedgerIndicator);
    expect(html).toContain('Ledger hardware wallet account');
    expect(html).toContain('role="img"');
  });
});
