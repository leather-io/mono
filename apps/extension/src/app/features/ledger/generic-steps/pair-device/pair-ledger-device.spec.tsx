import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, test, vi } from 'vitest';

import { OutdatedStacksAppWarningBase } from '../outdated-stacks-app-warning/outdated-stacks-app-warning-base';
import { PairLedgerDevice } from './pair-ledger-device';

const mocks = vi.hoisted(() => ({
  toConnectStepAndTryAgain: vi.fn(),
  handOffLedgerFlowToFullPage: vi.fn(),
  cancelLedgerAction: vi.fn(),
}));

vi.mock('leather-styles/jsx', () => ({
  Box({ children }: { children: React.ReactNode }) {
    return <div>{children}</div>;
  },
  Flex({ children }: { children: React.ReactNode }) {
    return <div>{children}</div>;
  },
  HStack({ children }: { children: React.ReactNode }) {
    return <div>{children}</div>;
  },
  Stack({ children }: { children: React.ReactNode }) {
    return <div>{children}</div>;
  },
  styled: {
    p({ children }: { children: React.ReactNode }) {
      return <p>{children}</p>;
    },
    a({ children, href, target, rel }: React.ComponentProps<'a'>) {
      return (
        <a href={href} target={target} rel={rel}>
          {children}
        </a>
      );
    },
    span({ children }: { children: React.ReactNode }) {
      return <span>{children}</span>;
    },
  },
}));

vi.mock('@leather.io/ui', () => ({
  Flag({ children }: { children: React.ReactNode }) {
    return <div>{children}</div>;
  },
  ExternalLinkIcon: () => null,
  InfoCircleIcon: () => null,
  Tooltip: {
    Root({ children }: { children: React.ReactNode }) {
      return <div>{children}</div>;
    },
    Trigger({ children }: { children: React.ReactNode }) {
      return <div>{children}</div>;
    },
    Content: () => null,
    Arrow: () => null,
  },
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
  useLedgerSteps: () => ({
    toConnectStepAndTryAgain: mocks.toConnectStepAndTryAgain,
    cancelLedgerAction: mocks.cancelLedgerAction,
  }),
  useLedgerStep: () => ({
    name: 'outdated-stacks-app',
    versionInfo: { currentVersion: '0.26.4', requiredVersion: '0.26.19' },
  }),
}));

vi.mock('@app/common/theme-provider', () => ({
  useThemeSwitcher: () => ({ theme: 'light' }),
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

describe(OutdatedStacksAppWarningBase.name, () => {
  test('offers a download fallback while keeping the update instructions and retry available', () => {
    const onTryAgain = vi.fn();
    render(<OutdatedStacksAppWarningBase onTryAgain={onTryAgain} />);

    const open = screen.getByRole('link', { name: /Open Ledger Wallet/ });
    expect(open.getAttribute('href')).toBe('ledgerlive://manager');
    const download = screen.getByRole('link', {
      name: 'Not installed? Download Ledger Wallet',
    });
    expect(download.getAttribute('href')).toBe('https://www.ledger.com/ledger-live/download');
    expect(download.getAttribute('target')).toBe('_blank');
    expect(download.getAttribute('rel')).toBe('noopener noreferrer');
    expect(screen.getAllByText(/formerly Ledger Live/)).toHaveLength(1);
    expect(screen.getByText(/0\.26\.4/).textContent).toContain('0.26.19');

    document.addEventListener('click', event => event.preventDefault(), { once: true });
    fireEvent.click(open);
    fireEvent.focus(window);

    expect(screen.getByText('Reconnect your Ledger and try again')).toBeDefined();
    expect(screen.getByRole('link', { name: 'Not installed? Download Ledger Wallet' })).toBe(
      download
    );
    fireEvent.click(screen.getByRole('button', { name: 'Try again' }));
    expect(onTryAgain).toHaveBeenCalledOnce();
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(mocks.cancelLedgerAction).toHaveBeenCalledOnce();
    expect(mocks.handOffLedgerFlowToFullPage).not.toHaveBeenCalled();
  });
});
