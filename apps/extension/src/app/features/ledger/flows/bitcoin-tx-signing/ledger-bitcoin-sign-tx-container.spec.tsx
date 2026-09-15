// @vitest-environment jsdom
import { type ReactNode } from 'react';

import {
  DisconnectedDeviceDuringOperation,
  StatusCodes,
  TransportStatusError,
} from '@ledgerhq/errors';
import { bytesToHex } from '@noble/hashes/utils';
import * as btc from '@scure/btc-signer';
import { act, render } from '@testing-library/react';
import { beforeEach, describe, expect, test, vi } from 'vitest';

import type { LedgerTxSigningContext } from '@app/features/ledger/generic-flows/tx-signing/ledger-sign-tx.context';

import { ledgerBitcoinTxSigningRoutes } from './ledger-bitcoin-sign-tx-container';

const mocks = vi.hoisted(() => ({
  toCheckingAppVersion: vi.fn(),
  toConnectionSuccessStep: vi.fn(),
  toDeviceBusyStep: vi.fn(),
  toAwaitingDeviceOperation: vi.fn(),
  toOperationRejectedStep: vi.fn(),
  toErrorStep: vi.fn(),
  cancelLedgerAction: vi.fn(),
  transactionSignedOnLedgerRejected: vi.fn(),
  connectApp: vi.fn(),
  getBitcoinAppVersion: vi.fn(),
  signLedger: vi.fn(),
  signLedgerDescriptor: vi.fn(),
  toastError: vi.fn(),
  publish: vi.fn(),
  captureContext: vi.fn<(value: LedgerTxSigningContext) => void>(),
  location: { pathname: '/', state: {} as Record<string, unknown> },
}));

vi.mock('react-router', async importOriginal => {
  const actual = await importOriginal<typeof import('react-router')>();
  return { ...actual, useLocation: () => mocks.location };
});

vi.mock('@ledgerhq/ledger-bitcoin', () => ({
  default: vi.fn(),
}));

vi.mock('@app/features/ledger/hooks/use-ledger-navigate', () => ({
  useLedgerNavigate: () => ({
    toCheckingAppVersion: mocks.toCheckingAppVersion,
    toConnectionSuccessStep: mocks.toConnectionSuccessStep,
    toDeviceBusyStep: mocks.toDeviceBusyStep,
    toAwaitingDeviceOperation: mocks.toAwaitingDeviceOperation,
    toOperationRejectedStep: mocks.toOperationRejectedStep,
    toErrorStep: mocks.toErrorStep,
    cancelLedgerAction: mocks.cancelLedgerAction,
  }),
}));

vi.mock('@app/features/ledger/hooks/use-ledger-analytics.hook', () => ({
  useLedgerAnalytics: () => ({
    transactionSignedOnLedgerRejected: mocks.transactionSignedOnLedgerRejected,
  }),
}));

vi.mock('@app/features/ledger/generic-flows/tx-signing/ledger-sign-tx-route-generator', () => ({
  ledgerSignTxRoutes: ({ component }: { component: ReactNode }) => component,
}));

vi.mock('@app/features/ledger/generic-flows/tx-signing/tx-signing-flow', () => ({
  TxSigningFlow(props: { context: LedgerTxSigningContext }) {
    mocks.captureContext(props.context);
    return null;
  },
}));

vi.mock(
  '@app/features/ledger/flows/bitcoin-tx-signing/steps/approve-bitcoin-sign-ledger-tx',
  () => ({
    ApproveSignLedgerBitcoinTx: () => null,
  })
);

vi.mock('./use-sign-ledger-descriptor-tx', () => ({
  useSignLedgerDescriptorTx: () => mocks.signLedgerDescriptor,
}));

vi.mock('@app/store/accounts/blockchain/bitcoin/bitcoin.hooks', () => ({
  useSignLedgerBitcoinTx: () => mocks.signLedger,
}));

vi.mock('@app/store/networks/networks.selectors', () => ({
  useCurrentNetwork: () => ({ chain: { bitcoin: { mode: 'mainnet' } } }),
}));

vi.mock('@app/features/toasts/use-toast', () => ({
  useToast: () => ({ error: mocks.toastError }),
}));

vi.mock('@app/common/hooks/use-scroll-lock', () => ({
  useScrollLock: vi.fn(),
}));

vi.mock('@app/common/publish-subscribe', () => ({
  appEvents: { publish: mocks.publish },
}));

vi.mock('@app/features/ledger/utils/bitcoin-ledger-utils', () => ({
  connectLedgerBitcoinApp: () => mocks.connectApp,
  getBitcoinAppVersion: mocks.getBitcoinAppVersion,
  isBitcoinAppOpen: () => () => true,
}));

vi.mock('@app/features/ledger/utils/generic-ledger-utils', async importOriginal => {
  const actual =
    await importOriginal<typeof import('@app/features/ledger/utils/generic-ledger-utils')>();
  return { ...actual, useCancelLedgerAction: () => false };
});

vi.mock('@leather.io/utils', async importOriginal => {
  const actual = await importOriginal<typeof import('@leather.io/utils')>();
  return { ...actual, delay: () => Promise.resolve() };
});

vi.mock('@shared/logger', () => ({
  logger: { error: vi.fn(), warn: vi.fn(), info: vi.fn(), debug: vi.fn() },
}));

const bitcoinAppVersion = { name: 'Bitcoin', version: '2.1.0', flags: 0 };
const unsignedPsbt = bytesToHex(new btc.Transaction().toPSBT());
const deniedError = new TransportStatusError(StatusCodes.CONDITIONS_OF_USE_NOT_SATISFIED);
const disconnectError = new DisconnectedDeviceDuringOperation('device disconnected');

function renderSignTxContext(): LedgerTxSigningContext {
  render(ledgerBitcoinTxSigningRoutes);
  const call = mocks.captureContext.mock.calls.at(-1);
  if (!call) throw new Error('Tx signing context was not rendered');
  return call[0];
}

interface SetupSignTransactionParams {
  settleOnRejection?: boolean;
  descriptor?: string;
  error?: Error;
}

function setupSignTransaction({
  settleOnRejection,
  descriptor,
  error,
}: SetupSignTransactionParams) {
  mocks.location = {
    pathname: '/swap/bitcoin/BTC/sBTC/review/bitcoin/connect-your-ledger',
    state: { tx: unsignedPsbt, inputsToSign: [], settleOnRejection, descriptor },
  };
  mocks.connectApp.mockResolvedValue({
    transport: { close: vi.fn().mockResolvedValue(undefined) },
  });
  mocks.getBitcoinAppVersion.mockResolvedValue(bitcoinAppVersion);
  if (error) {
    mocks.signLedger.mockRejectedValue(error);
    mocks.signLedgerDescriptor.mockRejectedValue(error);
  } else {
    mocks.signLedger.mockResolvedValue(undefined);
    mocks.signLedgerDescriptor.mockResolvedValue(undefined);
  }
  return { context: renderSignTxContext() };
}

describe('LedgerSignBitcoinTxContainer', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('settles a device denial as a cancellation when the swap opted in', async () => {
    const { context } = setupSignTransaction({ settleOnRejection: true, error: deniedError });

    await act(async () => {
      await context.signTransaction();
    });

    expect(mocks.publish).toHaveBeenCalledOnce();
    expect(mocks.publish).toHaveBeenCalledWith('ledgerBitcoinTxSigningCancelled', {
      unsignedPsbt,
    });
    expect(mocks.publish.mock.calls[0][1]).not.toHaveProperty('error');
    expect(mocks.toOperationRejectedStep).not.toHaveBeenCalled();
    expect(mocks.transactionSignedOnLedgerRejected).toHaveBeenCalledOnce();
  });

  test('forwards other device errors to the swap when it opted in', async () => {
    const { context } = setupSignTransaction({ settleOnRejection: true, error: disconnectError });

    await act(async () => {
      await context.signTransaction();
    });

    expect(mocks.publish).toHaveBeenCalledOnce();
    expect(mocks.publish).toHaveBeenCalledWith('ledgerBitcoinTxSigningCancelled', {
      unsignedPsbt,
      error: disconnectError.message,
    });
    expect(mocks.toOperationRejectedStep).not.toHaveBeenCalled();
  });

  test('forwards a missing signed transaction to the swap when it opted in', async () => {
    const { context } = setupSignTransaction({ settleOnRejection: true });

    await act(async () => {
      await context.signTransaction();
    });

    expect(mocks.publish).toHaveBeenCalledWith('ledgerBitcoinTxSigningCancelled', {
      unsignedPsbt,
      error: 'No tx returned',
    });
  });

  test('forwards the device error when settling a descriptor signing request', async () => {
    const { context } = setupSignTransaction({ descriptor: 'wpkh(@0/**)', error: deniedError });

    await act(async () => {
      await context.signTransaction();
    });

    expect(mocks.publish).toHaveBeenCalledOnce();
    expect(mocks.publish).toHaveBeenCalledWith('ledgerBitcoinTxSigningCancelled', {
      unsignedPsbt,
      error: deniedError.message,
    });
    expect(mocks.toOperationRejectedStep).not.toHaveBeenCalled();
  });

  test('keeps the rejected step and leaves the promise pending for other flows', async () => {
    const { context } = setupSignTransaction({ error: deniedError });

    await act(async () => {
      await context.signTransaction();
    });

    expect(mocks.toOperationRejectedStep).toHaveBeenCalledOnce();
    expect(mocks.publish).not.toHaveBeenCalled();
  });
});
