import { renderToString } from 'react-dom/server';

import { LedgerStacksGate } from './ledger-stacks-gate';

const activeWalletTypeMock = vi.fn();
const hasLedgerStacksKeysMock = vi.fn();

vi.mock('@app/store/common/wallet-type.selectors', () => ({
  useActiveWalletType: () => activeWalletTypeMock(),
}));

vi.mock('@app/store/ledger/ledger.selectors', () => ({
  useHasLedgerStacksKeys: () => hasLedgerStacksKeysMock(),
}));

vi.mock('@app/features/ledger/generic-steps/connect-device/connect-ledger-stacks', () => ({
  ConnectLedgerStacks: () => <span>connect-ledger-stacks</span>,
}));

const children = <span>protected-content</span>;

describe(LedgerStacksGate.name, () => {
  test('renders children for a software account even when a Ledger wallet also exists', () => {
    activeWalletTypeMock.mockReturnValue('software');
    hasLedgerStacksKeysMock.mockReturnValue(false);

    const html = renderToString(<LedgerStacksGate>{children}</LedgerStacksGate>);

    expect(html).toContain('protected-content');
    expect(html).not.toContain('connect-ledger-stacks');
  });

  test('renders the connect-device fallback for a Ledger account without stacks keys', () => {
    activeWalletTypeMock.mockReturnValue('ledger');
    hasLedgerStacksKeysMock.mockReturnValue(false);

    const html = renderToString(<LedgerStacksGate>{children}</LedgerStacksGate>);

    expect(html).toContain('connect-ledger-stacks');
    expect(html).not.toContain('protected-content');
  });

  test('renders children for a Ledger account that already has stacks keys', () => {
    activeWalletTypeMock.mockReturnValue('ledger');
    hasLedgerStacksKeysMock.mockReturnValue(true);

    const html = renderToString(<LedgerStacksGate>{children}</LedgerStacksGate>);

    expect(html).toContain('protected-content');
    expect(html).not.toContain('connect-ledger-stacks');
  });
});
