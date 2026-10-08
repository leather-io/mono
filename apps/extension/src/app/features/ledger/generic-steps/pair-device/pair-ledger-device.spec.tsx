import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, test, vi } from 'vitest';

import { PairLedgerDevice } from './pair-ledger-device';

const mocks = vi.hoisted(() => ({
  toConnectStepAndTryAgain: vi.fn(),
  handOffLedgerFlowToFullPage: vi.fn(),
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

vi.mock('@app/features/ledger/flow/ledger-flow.context', () => ({
  useLedgerSteps: () => ({ toConnectStepAndTryAgain: mocks.toConnectStepAndTryAgain }),
}));

vi.mock('@app/features/ledger/flow/ledger-flow-handoff', () => ({
  handOffLedgerFlowToFullPage: mocks.handOffLedgerFlowToFullPage,
}));

describe(PairLedgerDevice.name, () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('hands the pairing flow off to a full tab and closes the window', () => {
    render(<PairLedgerDevice />);

    fireEvent.click(screen.getByRole('button', { name: 'Open Leather in full screen' }));

    expect(mocks.handOffLedgerFlowToFullPage).toHaveBeenCalledWith(
      { kind: 'pair-device' },
      { closeCurrentWindow: true }
    );
  });

  test('retries the connection on demand without leaving the window', () => {
    render(<PairLedgerDevice />);

    fireEvent.click(screen.getByRole('button', { name: 'Try again' }));

    expect(mocks.toConnectStepAndTryAgain).toHaveBeenCalledOnce();
    expect(mocks.handOffLedgerFlowToFullPage).not.toHaveBeenCalled();
  });
});
