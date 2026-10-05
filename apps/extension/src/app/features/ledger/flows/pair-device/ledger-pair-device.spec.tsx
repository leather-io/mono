import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, test, vi } from 'vitest';

import { pairLedgerDeviceRoute } from './ledger-pair-device';

const sessionId = 'session-1';

const mocks = vi.hoisted(() => ({
  connectLedgerDeviceToApp: vi.fn(),
  closeLedgerSession: vi.fn(),
  navigate: vi.fn(),
  redirect: vi.fn(),
  backgroundLocation: { pathname: '/' } as { pathname: string } | undefined,
}));

vi.mock('leather-styles/jsx', () => ({
  styled: {
    span({ children }: { children: React.ReactNode }) {
      return <span>{children}</span>;
    },
  },
}));

vi.mock('@leather.io/ui', () => ({
  Button({ children, onClick }: { children: React.ReactNode; onClick(): void }) {
    return <button onClick={onClick}>{children}</button>;
  },
  Callout({ children }: { children: React.ReactNode }) {
    return <div>{children}</div>;
  },
  Sheet({ children }: { children: React.ReactNode }) {
    return <div>{children}</div>;
  },
  SheetHeader: () => null,
}));

vi.mock('../../components/ledger-wrapper', () => ({
  LedgerWrapper({ children }: { children: React.ReactNode }) {
    return <div>{children}</div>;
  },
}));

vi.mock('../../components/ledger-title', () => ({
  LedgerTitle({ children }: { children: React.ReactNode }) {
    return <h1>{children}</h1>;
  },
}));

vi.mock('react-router', async importOriginal => {
  const actual = await importOriginal<typeof import('react-router')>();
  return {
    ...actual,
    useNavigate: () => mocks.navigate,
    Navigate(props: { to: string; state: unknown }) {
      mocks.redirect(props.to, props.state);
      return null;
    },
  };
});

vi.mock('@app/routes/hooks/use-background-location', () => ({
  useBackgroundLocation: () => mocks.backgroundLocation,
}));

vi.mock('../../dmk/ledger-dmk.context', () => ({
  LedgerDmkProvider: ({ children }: { children: React.ReactNode }) => children,
  useLedgerDmk: () => ({}),
}));

vi.mock('../../dmk/ledger-device-connection', () => ({
  connectLedgerDeviceToApp: mocks.connectLedgerDeviceToApp,
}));

vi.mock('../../dmk/ledger-session', () => ({
  closeLedgerSession: mocks.closeLedgerSession,
}));

function clickConnect() {
  render(pairLedgerDeviceRoute.props.element);
  fireEvent.click(screen.getByRole('button', { name: 'Connect Ledger' }));
}

describe('LedgerPairDevice', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.backgroundLocation = { pathname: '/' };
  });

  test('reloads itself over the home page when opened directly in a new tab', () => {
    mocks.backgroundLocation = undefined;

    render(pairLedgerDeviceRoute.props.element);

    expect(mocks.redirect).toHaveBeenCalledWith('/pair-ledger', {
      backgroundLocation: { pathname: '/' },
    });
    expect(screen.queryByRole('button', { name: 'Connect Ledger' })).toBeNull();
  });

  test('releases the device and tells the user to restart their request once connected', async () => {
    mocks.connectLedgerDeviceToApp.mockResolvedValue(sessionId);

    clickConnect();

    await screen.findByText('Your Ledger is connected');
    expect(mocks.connectLedgerDeviceToApp).toHaveBeenCalledWith(expect.anything(), null);
    expect(mocks.closeLedgerSession).toHaveBeenCalledWith(expect.anything(), sessionId);
    expect(screen.queryByRole('button', { name: 'Connect Ledger' })).toBeNull();
  });

  test('offers another attempt when the device does not connect', async () => {
    mocks.connectLedgerDeviceToApp.mockRejectedValue(new Error('No selected device'));

    clickConnect();

    await screen.findByText(/couldn't connect to your Ledger/);
    expect(screen.getByRole('button', { name: 'Connect Ledger' })).toBeTruthy();
    expect(mocks.closeLedgerSession).not.toHaveBeenCalled();
  });
});
