import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, test, vi } from 'vitest';

import { RouteUrls } from '@shared/route-urls';

import { PairLedgerDevice } from './pair-ledger-device';

const mocks = vi.hoisted(() => ({
  toConnectStepAndTryAgain: vi.fn(),
  openIndexPageInNewTab: vi.fn(),
  closeWindow: vi.fn(),
}));

vi.mock('leather-styles/jsx', () => ({
  Stack({ children }: { children: React.ReactNode }) {
    return <div>{children}</div>;
  },
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

vi.mock('../../hooks/use-ledger-navigate', () => ({
  useLedgerNavigate: () => ({ toConnectStepAndTryAgain: mocks.toConnectStepAndTryAgain }),
}));

vi.mock('@shared/utils', () => ({
  closeWindow: mocks.closeWindow,
}));

vi.mock('@app/common/utils/open-in-new-tab', () => ({
  openIndexPageInNewTab: mocks.openIndexPageInNewTab,
}));

describe(PairLedgerDevice.name, () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('opens the pairing page in a full tab and closes the window', async () => {
    render(<PairLedgerDevice />);

    fireEvent.click(screen.getByRole('button', { name: 'Open Leather in full screen' }));

    await waitFor(() => expect(mocks.closeWindow).toHaveBeenCalledOnce());
    expect(mocks.openIndexPageInNewTab).toHaveBeenCalledWith(`/${RouteUrls.LedgerPairDeviceTab}`);
  });

  test('retries the connection on demand without leaving the window', () => {
    render(<PairLedgerDevice />);

    fireEvent.click(screen.getByRole('button', { name: 'Try again' }));

    expect(mocks.toConnectStepAndTryAgain).toHaveBeenCalledOnce();
    expect(mocks.closeWindow).not.toHaveBeenCalled();
  });
});
