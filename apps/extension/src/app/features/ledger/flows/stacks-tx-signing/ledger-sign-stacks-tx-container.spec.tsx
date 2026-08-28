// @vitest-environment jsdom
import { type ReactNode } from 'react';

import { act, render } from '@testing-library/react';
import { LedgerError } from '@zondax/ledger-stacks';
import { beforeEach, describe, expect, test, vi } from 'vitest';

import type { LedgerTxSigningContext } from '@app/features/ledger/generic-flows/tx-signing/ledger-sign-tx.context';

import { ledgerStacksTxSigningRoutes } from './ledger-sign-stacks-tx-container';

const mocks = vi.hoisted(() => ({
  toCheckingAppVersion: vi.fn(),
  toConnectionSuccessStep: vi.fn(),
  toAwaitingDeviceOperation: vi.fn(),
  toDevicePayloadInvalid: vi.fn(),
  toOperationRejectedStep: vi.fn(),
  toBroadcastErrorStep: vi.fn(),
  toErrorStep: vi.fn(),
  transactionSignedOnLedgerSuccessfully: vi.fn(),
  transactionSignedOnLedgerRejected: vi.fn(),
  connectApp: vi.fn(),
  getStacksAppVersion: vi.fn(),
  signTransaction: vi.fn(),
  versionGate: vi.fn(),
  migrateFingerprint: vi.fn(),
  publish: vi.fn(),
  captureContext: vi.fn<(value: LedgerTxSigningContext) => void>(),
  location: { pathname: '/', state: {} as Record<string, unknown> },
}));

vi.mock('@stacks/transactions', async importOriginal => {
  const actual = await importOriginal<typeof import('@stacks/transactions')>();
  return { ...actual, deserializeTransaction: () => null };
});

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
    toAwaitingDeviceOperation: mocks.toAwaitingDeviceOperation,
    toDevicePayloadInvalid: mocks.toDevicePayloadInvalid,
    toOperationRejectedStep: mocks.toOperationRejectedStep,
    toBroadcastErrorStep: mocks.toBroadcastErrorStep,
    toErrorStep: mocks.toErrorStep,
  }),
}));

vi.mock('@app/features/ledger/hooks/use-ledger-analytics.hook', () => ({
  useLedgerAnalytics: () => ({
    transactionSignedOnLedgerSuccessfully: mocks.transactionSignedOnLedgerSuccessfully,
    transactionSignedOnLedgerRejected: mocks.transactionSignedOnLedgerRejected,
  }),
}));

vi.mock('@app/features/ledger/hooks/use-ledger-fingerprint-migration', () => ({
  useLedgerFingerprintMigration: () => mocks.migrateFingerprint,
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

vi.mock('./steps/approve-sign-stacks-ledger-tx', () => ({
  ApproveSignLedgerStacksTx: () => null,
}));

vi.mock('@app/common/hooks/use-scroll-lock', () => ({
  useScrollLock: vi.fn(),
}));

vi.mock('@app/common/publish-subscribe', () => ({
  appEvents: { publish: mocks.publish },
}));

vi.mock('@app/store/accounts/blockchain/stacks/stacks-account.hooks', () => ({
  useCurrentStacksAccount: () => ({
    derivationPath: "m/44'/5757'/0'/0/0",
    stxPublicKey: '029f9d43e161b2ecb86d78262d47d2cd10d20ab7b4c303cd4f0e26744c72e340fc',
  }),
}));

vi.mock('@app/features/ledger/utils/stacks-ledger-utils', async importOriginal => {
  const actual =
    await importOriginal<typeof import('@app/features/ledger/utils/stacks-ledger-utils')>();
  return {
    ...actual,
    connectLedgerStacksApp: mocks.connectApp,
    getStacksAppVersion: mocks.getStacksAppVersion,
    signLedgerStacksTransaction: mocks.signTransaction,
  };
});

vi.mock('@app/features/ledger/utils/stacks-version-gate', () => ({
  stacksVersionGate: () => mocks.versionGate,
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

vi.mock('@shared/utils/analytics', () => ({
  analytics: { track: vi.fn() },
}));

vi.mock('@shared/logger', () => ({
  logger: { error: vi.fn(), warn: vi.fn(), info: vi.fn(), debug: vi.fn() },
}));

const stacksAppVersion = {
  name: 'Stacks',
  chain: 'stacks',
  returnCode: LedgerError.NoErrors,
  errorMessage: 'No errors',
  testMode: false,
  deviceLocked: false,
  targetId: '',
  major: 0,
  minor: 26,
  patch: 17,
};

const unsignedTx =
  '000000000104008e3c2222876b4b723fdbf79ac3e60564c3639bad0000000000000000000000000000006400000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000302000000000005163b11c6abb50beb04bb884dfefd2ae9993121331d00000000000001f400000000000000000000000000000000000000000000000000000000000000000000';

function renderSignTxContext(): LedgerTxSigningContext {
  render(ledgerStacksTxSigningRoutes);
  const call = mocks.captureContext.mock.calls.at(-1);
  if (!call) throw new Error('Tx signing context was not rendered');
  return call[0];
}

const transportFailureReturnCode = 0xffff;

interface SetupSignTransactionParams {
  returnCode: number;
  errorMessage: string;
  settleOnRejection?: boolean;
}

function setupSignTransaction({
  returnCode,
  errorMessage,
  settleOnRejection,
}: SetupSignTransactionParams) {
  const transportClose = vi.fn().mockResolvedValue(undefined);
  mocks.location = {
    pathname: '/swap/stacks/STX/aeUSDC/review/stacks/connect-your-ledger',
    state: { tx: unsignedTx, settleOnRejection },
  };
  mocks.connectApp.mockResolvedValue({ transport: { close: transportClose } });
  mocks.getStacksAppVersion.mockResolvedValue(stacksAppVersion);
  mocks.versionGate.mockResolvedValue(true);
  mocks.migrateFingerprint.mockResolvedValue(undefined);
  mocks.signTransaction.mockReturnValue(() => Promise.resolve({ returnCode, errorMessage }));
  return { transportClose, context: renderSignTxContext() };
}

describe('LedgerSignStacksTxContainer', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('settles a device denial as a cancellation when the swap opted in', async () => {
    const { transportClose, context } = setupSignTransaction({
      returnCode: LedgerError.TransactionRejected,
      errorMessage: 'Transaction rejected',
      settleOnRejection: true,
    });

    await act(async () => {
      await context.signTransaction();
    });

    expect(mocks.publish).toHaveBeenCalledOnce();
    expect(mocks.publish).toHaveBeenCalledWith('ledgerStacksTxSigningCancelled', { unsignedTx });
    expect(mocks.publish.mock.calls[0][1]).not.toHaveProperty('error');
    expect(mocks.toOperationRejectedStep).not.toHaveBeenCalled();
    expect(mocks.transactionSignedOnLedgerRejected).toHaveBeenCalledOnce();
    expect(transportClose).toHaveBeenCalledOnce();
  });

  test('forwards an invalid payload error to the swap when it opted in', async () => {
    const { context } = setupSignTransaction({
      returnCode: LedgerError.DataIsInvalid,
      errorMessage: 'Data is invalid : bad tx',
      settleOnRejection: true,
    });

    await act(async () => {
      await context.signTransaction();
    });

    expect(mocks.publish).toHaveBeenCalledOnce();
    expect(mocks.publish).toHaveBeenCalledWith('ledgerStacksTxSigningCancelled', {
      unsignedTx,
      error: 'Data is invalid : bad tx',
    });
    expect(mocks.toDevicePayloadInvalid).not.toHaveBeenCalled();
    expect(mocks.toErrorStep).not.toHaveBeenCalled();
  });

  test('forwards a transport failure to the swap when it opted in', async () => {
    const { context } = setupSignTransaction({
      returnCode: transportFailureReturnCode,
      errorMessage: 'DisconnectedDeviceDuringOperation: device disconnected',
      settleOnRejection: true,
    });

    await act(async () => {
      await context.signTransaction();
    });

    expect(mocks.publish).toHaveBeenCalledWith('ledgerStacksTxSigningCancelled', {
      unsignedTx,
      error: 'DisconnectedDeviceDuringOperation: device disconnected',
    });
    expect(mocks.toErrorStep).not.toHaveBeenCalled();
  });

  test('keeps the rejected step and leaves the promise pending for other flows', async () => {
    const { transportClose, context } = setupSignTransaction({
      returnCode: LedgerError.TransactionRejected,
      errorMessage: 'Transaction rejected',
    });

    await act(async () => {
      await context.signTransaction();
    });

    expect(mocks.toOperationRejectedStep).toHaveBeenCalledOnce();
    expect(mocks.publish).not.toHaveBeenCalled();
    expect(transportClose).toHaveBeenCalledOnce();
  });

  test('shows the invalid payload step for other flows', async () => {
    const { context } = setupSignTransaction({
      returnCode: LedgerError.DataIsInvalid,
      errorMessage: 'Data is invalid : bad tx',
    });

    await act(async () => {
      await context.signTransaction();
    });

    expect(mocks.toDevicePayloadInvalid).toHaveBeenCalledOnce();
    expect(mocks.publish).not.toHaveBeenCalled();
  });
});
