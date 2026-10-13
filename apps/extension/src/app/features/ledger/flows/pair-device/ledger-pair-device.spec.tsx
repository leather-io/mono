import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, test, vi } from 'vitest';

import { LedgerPairDevice } from './ledger-pair-device';

const sessionId = 'session-1';

const mocks = vi.hoisted(() => ({
  connectLedgerDeviceToApp: vi.fn(),
  closeLedgerSession: vi.fn(),
  onClose: vi.fn(),
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

vi.mock('../../dmk/ledger-dmk.context', () => ({
  useLedgerDmk: () => ({}),
}));

vi.mock('../../dmk/ledger-device-connection', () => ({
  connectLedgerDeviceToApp: mocks.connectLedgerDeviceToApp,
}));

vi.mock('../../dmk/ledger-session', () => ({
  closeLedgerSession: mocks.closeLedgerSession,
}));

function clickConnect() {
  render(<LedgerPairDevice onClose={mocks.onClose} />);
  fireEvent.click(screen.getByRole('button', { name: 'Connect Ledger' }));
}

describe(LedgerPairDevice.name, () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('releases the device and tells the user to restart their request once connected', async () => {
    mocks.connectLedgerDeviceToApp.mockResolvedValue(sessionId);

    clickConnect();

    await screen.findByText('Your Ledger is connected');
    expect(mocks.connectLedgerDeviceToApp).toHaveBeenCalledWith(expect.anything(), null);
    expect(mocks.closeLedgerSession).toHaveBeenCalledWith(expect.anything(), sessionId);
    expect(screen.queryByRole('button', { name: 'Connect Ledger' })).toBeNull();

    fireEvent.click(screen.getByRole('button', { name: 'Done' }));

    expect(mocks.onClose).toHaveBeenCalledOnce();
  });

  test('offers another attempt when the device does not connect', async () => {
    mocks.connectLedgerDeviceToApp.mockRejectedValue(new Error('No selected device'));

    clickConnect();

    await screen.findByText(/couldn't connect to your Ledger/);
    expect(screen.getByRole('button', { name: 'Connect Ledger' })).toBeTruthy();
    expect(mocks.closeLedgerSession).not.toHaveBeenCalled();
  });
});
