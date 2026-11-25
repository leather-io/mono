import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, test, vi } from 'vitest';

import { HardwareWalletError } from '@leather.io/ledger';
import { makeFakeHardwareWalletConnector } from '@leather.io/ledger/test-utils';

import { LedgerPairDevice } from './ledger-pair-device';

const mocks = vi.hoisted(() => ({
  pair: vi.fn(),
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

vi.mock('../../hardware-wallet/hardware-wallet.context', () => ({
  useHardwareWalletConnector: () => makeFakeHardwareWalletConnector({ pair: mocks.pair }),
}));

vi.mock('@leather.io/bitcoin', () => ({
  makeNativeSegwitAccountDerivationPath: vi.fn(),
  makeTaprootAccountDerivationPath: vi.fn(),
}));

function clickConnect() {
  render(<LedgerPairDevice onClose={mocks.onClose} />);
  fireEvent.click(screen.getByRole('button', { name: 'Connect Ledger' }));
}

describe(LedgerPairDevice.name, () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('pairs the device and tells the user to restart their request once connected', async () => {
    mocks.pair.mockResolvedValue({ id: 'device-1', name: 'Nano S Plus', model: null });

    clickConnect();

    await screen.findByText('Your Ledger is connected');
    expect(mocks.pair).toHaveBeenCalledWith({});
    expect(screen.queryByRole('button', { name: 'Connect Ledger' })).toBeNull();

    fireEvent.click(screen.getByRole('button', { name: 'Done' }));

    expect(mocks.onClose).toHaveBeenCalledOnce();
  });

  test('offers another attempt when the device does not connect', async () => {
    mocks.pair.mockRejectedValue(new HardwareWalletError('no-device-selected'));

    clickConnect();

    await screen.findByText(/couldn't connect to your Ledger/);
    expect(screen.getByRole('button', { name: 'Connect Ledger' })).toBeTruthy();
  });
});
