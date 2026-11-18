// @vitest-environment jsdom
import type * as StacksTransactions from '@stacks/transactions';
import { act, render } from '@testing-library/react';
import { beforeEach, describe, expect, test, vi } from 'vitest';

import { HardwareWalletError } from '@leather.io/ledger';
import {
  makeFakeHardwareStacksSigner,
  makeFakeHardwareWallet,
  makeFakeHardwareWalletConnector,
  makeFakeHardwareWalletSession,
} from '@leather.io/ledger/test-utils';
import type * as LeatherUtils from '@leather.io/utils';

import type { LedgerSigningOutcome } from '@app/features/ledger/flow/ledger-flow.types';
import type { LedgerTxSigningContext } from '@app/features/ledger/generic-flows/tx-signing/ledger-sign-tx.context';
import type * as GenericLedgerUtils from '@app/features/ledger/utils/generic-ledger-utils';

import { LedgerSignStacksTxContainer } from './ledger-sign-stacks-tx-container';

const mocks = vi.hoisted(() => ({
  toCheckingAppVersion: vi.fn(),
  toConnectionSuccessStep: vi.fn(),
  toAwaitingDeviceOperation: vi.fn(),
  toDevicePayloadInvalid: vi.fn(),
  toOperationRejectedStep: vi.fn(),
  toDeviceDisconnectStep: vi.fn(),
  toErrorStep: vi.fn(),
  settleLedgerAction: vi.fn(),
  transactionSignedOnLedgerSuccessfully: vi.fn(),
  transactionSignedOnLedgerRejected: vi.fn(),
  connect: vi.fn(),
  close: vi.fn(),
  signTransaction: vi.fn(),
  migrateFingerprint: vi.fn(),
  captureContext: vi.fn<(value: LedgerTxSigningContext) => void>(),
}));

const unsignedTransaction = { kind: 'unsigned' };

vi.mock('@stacks/transactions', async importOriginal => {
  const actual = await importOriginal<typeof StacksTransactions>();
  return { ...actual, deserializeTransaction: () => unsignedTransaction };
});

vi.mock('@app/features/ledger/hardware-wallet/hardware-wallet.context', () => ({
  useHardwareWalletConnector: () => makeFakeHardwareWalletConnector({ connect: mocks.connect }),
}));

vi.mock('@app/features/ledger/flow/ledger-flow.context', () => ({
  useLedgerFlowState: () => null,
  useLedgerSteps: () => ({
    toCheckingAppVersion: mocks.toCheckingAppVersion,
    toConnectionSuccessStep: mocks.toConnectionSuccessStep,
    toAwaitingDeviceOperation: mocks.toAwaitingDeviceOperation,
    toDevicePayloadInvalid: mocks.toDevicePayloadInvalid,
    toOperationRejectedStep: mocks.toOperationRejectedStep,
    toDeviceDisconnectStep: mocks.toDeviceDisconnectStep,
    toErrorStep: mocks.toErrorStep,
    settleLedgerAction: mocks.settleLedgerAction,
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

vi.mock('@app/store/accounts/blockchain/stacks/stacks-account.hooks', () => ({
  useCurrentStacksAccount: () => stacksAccount,
}));

vi.mock('@app/features/ledger/utils/generic-ledger-utils', async importOriginal => {
  const actual = await importOriginal<typeof GenericLedgerUtils>();
  return { ...actual, useCancelLedgerAction: () => false };
});

vi.mock('@leather.io/bitcoin', () => ({
  makeNativeSegwitAccountDerivationPath: vi.fn(),
  makeTaprootAccountDerivationPath: vi.fn(),
}));

vi.mock('@leather.io/utils', async importOriginal => {
  const actual = await importOriginal<typeof LeatherUtils>();
  return { ...actual, delay: () => Promise.resolve() };
});

vi.mock('@shared/logger', () => ({
  logger: { error: vi.fn(), warn: vi.fn(), info: vi.fn(), debug: vi.fn() },
}));

const stacksAccount = {
  derivationPath: "m/44'/5757'/0'/0/0",
  stxPublicKey: '029f9d43e161b2ecb86d78262d47d2cd10d20ab7b4c303cd4f0e26744c72e340fc',
};

const unsignedTx = '00deadbeef';
const requestId = 1;

function expectSettledOnceWith(outcome: LedgerSigningOutcome<unknown>) {
  expect(mocks.settleLedgerAction).toHaveBeenCalledOnce();
  expect(mocks.settleLedgerAction).toHaveBeenCalledWith(
    expect.objectContaining({ id: requestId }),
    outcome
  );
}

function renderSignTxContext(settleOnRejection: boolean): LedgerTxSigningContext {
  render(
    <LedgerSignStacksTxContainer
      request={{
        kind: 'sign-stacks-tx',
        id: requestId,
        resolve: vi.fn(),
        tx: unsignedTx,
        settleOnRejection,
      }}
    />
  );
  const call = mocks.captureContext.mock.calls.at(-1);
  if (!call) throw new Error('Tx signing context was not rendered');
  return call[0];
}

interface SetupSignTransactionParams {
  settleOnRejection?: boolean;
  signError?: HardwareWalletError;
  signedTx?: unknown;
}

function setupSignTransaction({
  settleOnRejection,
  signError,
  signedTx,
}: SetupSignTransactionParams) {
  mocks.connect.mockResolvedValue(
    makeFakeHardwareWalletSession({
      wallet: makeFakeHardwareWallet({
        stacks: makeFakeHardwareStacksSigner({ signTransaction: mocks.signTransaction }),
      }),
      close: mocks.close,
    })
  );
  mocks.close.mockResolvedValue(undefined);
  mocks.migrateFingerprint.mockResolvedValue(undefined);
  if (signError) mocks.signTransaction.mockRejectedValue(signError);
  else mocks.signTransaction.mockResolvedValue(signedTx);
  return { context: renderSignTxContext(settleOnRejection ?? false) };
}

describe('LedgerSignStacksTxContainer', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('settles the flow with the signed transaction', async () => {
    const signedTx = { signed: true };
    const { context } = setupSignTransaction({ signedTx });

    await act(async () => {
      await context.signTransaction();
    });

    expect(mocks.connect).toHaveBeenCalledWith({ chain: 'stacks' }, expect.anything());
    expect(mocks.migrateFingerprint).toHaveBeenCalledOnce();
    const signTransactionCall: unknown[] = mocks.signTransaction.mock.calls[0];
    expect(signTransactionCall[0]).toEqual({
      transaction: unsignedTransaction,
      key: {
        derivationPath: stacksAccount.derivationPath,
        publicKey: stacksAccount.stxPublicKey,
      },
    });
    expect(signTransactionCall[1]).toHaveProperty('signal');
    expect(mocks.transactionSignedOnLedgerSuccessfully).toHaveBeenCalledOnce();
    expectSettledOnceWith({ status: 'signed', value: signedTx });
    expect(mocks.close).toHaveBeenCalledOnce();
  });

  test('settles a device denial as a cancellation when the swap opted in', async () => {
    const { context } = setupSignTransaction({
      signError: new HardwareWalletError('rejected', { message: 'Transaction rejected' }),
      settleOnRejection: true,
    });

    await act(async () => {
      await context.signTransaction();
    });

    expectSettledOnceWith({ status: 'cancelled' });
    expect(mocks.toOperationRejectedStep).not.toHaveBeenCalled();
    expect(mocks.transactionSignedOnLedgerRejected).toHaveBeenCalledOnce();
    expect(mocks.close).toHaveBeenCalledOnce();
  });

  test('forwards an invalid payload error to the swap when it opted in', async () => {
    const { context } = setupSignTransaction({
      signError: new HardwareWalletError('invalid-payload', {
        message: 'Data is invalid : bad tx',
      }),
      settleOnRejection: true,
    });

    await act(async () => {
      await context.signTransaction();
    });

    expectSettledOnceWith({ status: 'failed', error: 'Data is invalid : bad tx' });
    expect(mocks.toDevicePayloadInvalid).not.toHaveBeenCalled();
    expect(mocks.toErrorStep).not.toHaveBeenCalled();
  });

  test('forwards a transport failure to the swap when it opted in', async () => {
    const { context } = setupSignTransaction({
      signError: new HardwareWalletError('disconnected', {
        message: 'DisconnectedDeviceDuringOperation: device disconnected',
      }),
      settleOnRejection: true,
    });

    await act(async () => {
      await context.signTransaction();
    });

    expectSettledOnceWith({
      status: 'failed',
      error: 'DisconnectedDeviceDuringOperation: device disconnected',
    });
    expect(mocks.toErrorStep).not.toHaveBeenCalled();
    expect(mocks.toDeviceDisconnectStep).not.toHaveBeenCalled();
  });

  test('keeps the rejected step and leaves the promise pending for other flows', async () => {
    const { context } = setupSignTransaction({
      signError: new HardwareWalletError('rejected', { message: 'Transaction rejected' }),
    });

    await act(async () => {
      await context.signTransaction();
    });

    expect(mocks.toOperationRejectedStep).toHaveBeenCalledOnce();
    expect(mocks.settleLedgerAction).not.toHaveBeenCalled();
    expect(mocks.close).toHaveBeenCalledOnce();
  });

  test('shows the invalid payload step for other flows', async () => {
    const { context } = setupSignTransaction({
      signError: new HardwareWalletError('invalid-payload', {
        message: 'Data is invalid : bad tx',
      }),
    });

    await act(async () => {
      await context.signTransaction();
    });

    expect(mocks.toDevicePayloadInvalid).toHaveBeenCalledOnce();
    expect(mocks.settleLedgerAction).not.toHaveBeenCalled();
  });

  test('shows the disconnected step for other flows when the device drops', async () => {
    const { context } = setupSignTransaction({
      signError: new HardwareWalletError('disconnected'),
    });

    await act(async () => {
      await context.signTransaction();
    });

    expect(mocks.toDeviceDisconnectStep).toHaveBeenCalledOnce();
    expect(mocks.settleLedgerAction).not.toHaveBeenCalled();
    expect(mocks.close).toHaveBeenCalledOnce();
  });
});
