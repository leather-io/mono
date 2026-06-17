import { renderToString } from 'react-dom/server';

import { LedgerBitcoinGate } from './ledger-bitcoin-gate';

const activeWalletTypeMock = vi.fn();
const hasLedgerBitcoinKeysMock = vi.fn();

vi.mock('@app/store/common/wallet-type.selectors', () => ({
  useActiveWalletType: () => activeWalletTypeMock(),
}));

vi.mock('@app/store/ledger/ledger.selectors', () => ({
  useHasLedgerBitcoinKeys: () => hasLedgerBitcoinKeysMock(),
}));

vi.mock('@app/features/ledger/generic-steps/connect-device/connect-ledger-bitcoin', () => ({
  ConnectLedgerBitcoin: () => <span>connect-ledger-bitcoin</span>,
}));

const children = <span>protected-content</span>;

describe(LedgerBitcoinGate.name, () => {
  test('renders children for a software account even when a Ledger wallet also exists', () => {
    activeWalletTypeMock.mockReturnValue('software');
    hasLedgerBitcoinKeysMock.mockReturnValue(false);

    const html = renderToString(<LedgerBitcoinGate>{children}</LedgerBitcoinGate>);

    expect(html).toContain('protected-content');
    expect(html).not.toContain('connect-ledger-bitcoin');
  });

  test('renders the connect-device fallback for a Ledger account without bitcoin keys', () => {
    activeWalletTypeMock.mockReturnValue('ledger');
    hasLedgerBitcoinKeysMock.mockReturnValue(false);

    const html = renderToString(<LedgerBitcoinGate>{children}</LedgerBitcoinGate>);

    expect(html).toContain('connect-ledger-bitcoin');
    expect(html).not.toContain('protected-content');
  });

  test('renders children for a Ledger account that already has bitcoin keys', () => {
    activeWalletTypeMock.mockReturnValue('ledger');
    hasLedgerBitcoinKeysMock.mockReturnValue(true);

    const html = renderToString(<LedgerBitcoinGate>{children}</LedgerBitcoinGate>);

    expect(html).toContain('protected-content');
    expect(html).not.toContain('connect-ledger-bitcoin');
  });
});
