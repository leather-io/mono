// @vitest-environment jsdom
import { act, createElement } from 'react';
import { createRoot } from 'react-dom/client';

import { HardwareWalletError } from '@leather.io/ledger';
import {
  makeFakeHardwareStacksSigner,
  makeFakeHardwareWallet,
  makeFakeHardwareWalletConnector,
  makeFakeHardwareWalletSession,
} from '@leather.io/ledger/test-utils';
import type * as LeatherUtils from '@leather.io/utils';

import type * as GenericLedgerUtils from '@app/features/ledger/utils/generic-ledger-utils';

import { LedgerSignMsgContainer } from './ledger-stacks-sign-msg-container';
import { type LedgerMessageSigningContext } from './ledger-stacks-sign-msg.context';
import type * as LedgerStacksSignMsgContext from './ledger-stacks-sign-msg.context';

Reflect.set(globalThis, 'IS_REACT_ACT_ENVIRONMENT', true);

const mocks = vi.hoisted(() => ({
  toCheckingAppVersion: vi.fn(),
  toConnectStep: vi.fn(),
  toConnectionSuccessStep: vi.fn(),
  toAwaitingDeviceOperation: vi.fn(),
  toDevicePayloadInvalid: vi.fn(),
  toOperationRejectedStep: vi.fn(),
  toDeviceDisconnectStep: vi.fn(),
  toStacksAppOutdatedWarning: vi.fn(),
  toErrorStep: vi.fn(),
  settleLedgerAction: vi.fn(),
  trackDeviceVersionInfo: vi.fn(),
  messageSignedOnLedgerSuccessfully: vi.fn(),
  messageSignedOnLedgerRejected: vi.fn(),
  connect: vi.fn(),
  close: vi.fn(),
  signMessage: vi.fn(),
  migrateFingerprint: vi.fn(),
  closeWithError: vi.fn(),
  captureContext: vi.fn<(value: LedgerMessageSigningContext) => void>(),
  account: vi.fn<() => StacksAccountMock | undefined>(),
}));

interface StacksAccountMock {
  derivationPath: string;
  stxPublicKey: string;
}

const stacksAccount: StacksAccountMock = {
  derivationPath: "m/44'/5757'/0'/0/0",
  stxPublicKey: '029f9d43e161b2ecb86d78262d47d2cd10d20ab7b4c303cd4f0e26744c72e340fc',
};

vi.mock('../../flow/ledger-flow.context', () => ({
  useLedgerFlowState: () => null,
  useLedgerFlow: () => ({ closeWithError: mocks.closeWithError }),
  useLedgerSteps: () => ({
    toCheckingAppVersion: mocks.toCheckingAppVersion,
    toConnectStep: mocks.toConnectStep,
    toConnectionSuccessStep: mocks.toConnectionSuccessStep,
    toAwaitingDeviceOperation: mocks.toAwaitingDeviceOperation,
    toDevicePayloadInvalid: mocks.toDevicePayloadInvalid,
    toOperationRejectedStep: mocks.toOperationRejectedStep,
    toDeviceDisconnectStep: mocks.toDeviceDisconnectStep,
    toStacksAppOutdatedWarning: mocks.toStacksAppOutdatedWarning,
    toErrorStep: mocks.toErrorStep,
    settleLedgerAction: mocks.settleLedgerAction,
  }),
}));

vi.mock('../../hooks/use-ledger-analytics.hook', () => ({
  useLedgerAnalytics: () => ({
    trackDeviceVersionInfo: mocks.trackDeviceVersionInfo,
    messageSignedOnLedgerSuccessfully: mocks.messageSignedOnLedgerSuccessfully,
    messageSignedOnLedgerRejected: mocks.messageSignedOnLedgerRejected,
  }),
}));

vi.mock('../../hooks/use-ledger-fingerprint-migration', () => ({
  useLedgerFingerprintMigration: () => mocks.migrateFingerprint,
}));

vi.mock('@app/common/hooks/use-scroll-lock', () => ({
  useScrollLock: vi.fn(),
}));

vi.mock('@app/store/accounts/blockchain/stacks/stacks-account.hooks', () => ({
  useCurrentStacksAccount: () => mocks.account(),
}));

vi.mock('../../flow/ledger-flow-sheet', () => ({
  LedgerFlowSheet: () => null,
}));

vi.mock('./steps/connect-ledger-sign-msg', () => ({
  ConnectLedgerSignMsg: () => null,
}));

vi.mock('./steps/outdated-stacks-app-warning-msg-signing', () => ({
  OutdatedStacksAppWarningMsgSigning: () => null,
}));

vi.mock('./steps/sign-stacks-ledger-message', () => ({
  SignLedgerMessage: () => null,
}));

vi.mock('@app/features/ledger/hardware-wallet/hardware-wallet.context', () => ({
  useHardwareWalletConnector: () => makeFakeHardwareWalletConnector({ connect: mocks.connect }),
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

vi.mock('./ledger-stacks-sign-msg.context', async importOriginal => {
  const actual = await importOriginal<typeof LedgerStacksSignMsgContext>();
  return {
    ...actual,
    LedgerMsgSigningProvider(props: { value: LedgerMessageSigningContext }) {
      mocks.captureContext(props.value);
      return null;
    },
  };
});

const stacksAppInfo = { name: 'Stacks', version: '0.26.19' };
const signature = { signature: 'aa'.repeat(65), publicKey: stacksAccount.stxPublicKey };

function renderSignMsgContainer() {
  const root = createRoot(document.createElement('div'));
  act(() => {
    root.render(
      createElement(LedgerSignMsgContainer, {
        request: {
          kind: 'sign-stacks-message',
          id: 1,
          resolve: vi.fn(),
          message: { messageType: 'utf8', message: 'hello leather' },
        },
      })
    );
  });
}

function renderSignMsgContext(): LedgerMessageSigningContext {
  renderSignMsgContainer();
  const call = mocks.captureContext.mock.calls.at(-1);
  if (!call) throw new Error('Message signing context was not rendered');
  return call[0];
}

function setupSignMessage() {
  mocks.connect.mockResolvedValue(
    makeFakeHardwareWalletSession({
      wallet: makeFakeHardwareWallet({
        stacks: makeFakeHardwareStacksSigner({ signMessage: mocks.signMessage }),
      }),
      app: stacksAppInfo,
      close: mocks.close,
    })
  );
  mocks.close.mockResolvedValue(undefined);
  mocks.migrateFingerprint.mockResolvedValue(undefined);
  mocks.signMessage.mockResolvedValue(signature);
  return { context: renderSignMsgContext() };
}

describe(LedgerSignMsgContainer.name, () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.account.mockReturnValue(stacksAccount);
  });

  test('closes the flow with an error when there is no active stacks account', () => {
    mocks.account.mockReturnValue(undefined);

    renderSignMsgContainer();

    expect(mocks.captureContext).not.toHaveBeenCalled();
    expect(mocks.closeWithError).toHaveBeenCalledOnce();
    expect(mocks.closeWithError).toHaveBeenCalledWith(
      'No active account found for message signing'
    );
  });

  test('keeps the flow open when an active stacks account exists', () => {
    renderSignMsgContainer();

    expect(mocks.captureContext).toHaveBeenCalled();
    expect(mocks.closeWithError).not.toHaveBeenCalled();
  });

  test('signs the message, settles the flow with the signature and closes the session once', async () => {
    const { context } = setupSignMessage();

    await act(async () => {
      await context.signMessage();
    });

    expect(mocks.trackDeviceVersionInfo).toHaveBeenCalledWith(stacksAppInfo);
    expect(mocks.migrateFingerprint).toHaveBeenCalledOnce();
    const signMessageCall: unknown[] = mocks.signMessage.mock.calls[0];
    expect(signMessageCall[0]).toEqual({
      message: 'hello leather',
      key: {
        derivationPath: stacksAccount.derivationPath,
        publicKey: stacksAccount.stxPublicKey,
      },
    });
    expect(signMessageCall[1]).toHaveProperty('signal');
    expect(mocks.messageSignedOnLedgerSuccessfully).toHaveBeenCalledOnce();
    expect(mocks.settleLedgerAction).toHaveBeenCalledOnce();
    expect(mocks.settleLedgerAction.mock.calls[0][1]).toEqual({
      status: 'signed',
      value: signature,
    });
    expect(mocks.toDeviceDisconnectStep).not.toHaveBeenCalled();
    expect(mocks.close).toHaveBeenCalledOnce();
  });

  test('stops before signing when the app is outdated', async () => {
    const { context } = setupSignMessage();
    const details = { currentVersion: '0.26.17', requiredVersion: '0.26.19' };
    mocks.connect.mockRejectedValue(new HardwareWalletError('outdated-app', { details }));

    await act(async () => {
      await context.signMessage();
    });

    expect(mocks.toStacksAppOutdatedWarning).toHaveBeenCalledWith(details);
    expect(mocks.signMessage).not.toHaveBeenCalled();
    expect(mocks.settleLedgerAction).not.toHaveBeenCalled();
    expect(mocks.close).not.toHaveBeenCalled();
  });

  test('returns to the connect step with a locked warning when the device is locked', async () => {
    const { context } = setupSignMessage();
    mocks.connect.mockRejectedValue(new HardwareWalletError('locked'));

    await act(async () => {
      await context.signMessage();
    });

    expect(mocks.toConnectStep).toHaveBeenCalledOnce();
    expect(mocks.signMessage).not.toHaveBeenCalled();
    const latest = mocks.captureContext.mock.calls.at(-1)?.[0].latestDeviceResponse;
    expect(latest).toEqual({ deviceLocked: true });
  });

  test('settles the flow as cancelled and closes the session once when signing is rejected', async () => {
    const { context } = setupSignMessage();
    mocks.signMessage.mockRejectedValue(new HardwareWalletError('rejected'));

    await act(async () => {
      await context.signMessage();
    });

    expect(mocks.toOperationRejectedStep).toHaveBeenCalledOnce();
    expect(mocks.messageSignedOnLedgerRejected).toHaveBeenCalledOnce();
    expect(mocks.settleLedgerAction).toHaveBeenCalledOnce();
    expect(mocks.settleLedgerAction.mock.calls[0][1]).toEqual({ status: 'cancelled' });
    expect(mocks.close).toHaveBeenCalledOnce();
  });

  test('shows the invalid payload step and leaves the promise pending', async () => {
    const { context } = setupSignMessage();
    mocks.signMessage.mockRejectedValue(new HardwareWalletError('invalid-payload'));

    await act(async () => {
      await context.signMessage();
    });

    expect(mocks.toDevicePayloadInvalid).toHaveBeenCalledOnce();
    expect(mocks.settleLedgerAction).not.toHaveBeenCalled();
    expect(mocks.close).toHaveBeenCalledOnce();
  });

  test('resolves without signing or navigating when the connection is cancelled', async () => {
    const { context } = setupSignMessage();
    mocks.connect.mockRejectedValue(new HardwareWalletError('cancelled'));

    await act(async () => {
      await expect(context.signMessage()).resolves.toBeUndefined();
    });

    expect(mocks.toCheckingAppVersion).not.toHaveBeenCalled();
    expect(mocks.toErrorStep).not.toHaveBeenCalled();
    expect(mocks.signMessage).not.toHaveBeenCalled();
    expect(mocks.settleLedgerAction).not.toHaveBeenCalled();
    expect(mocks.close).not.toHaveBeenCalled();
  });

  test('shows the disconnect step and closes the session once when the device drops', async () => {
    const { context } = setupSignMessage();
    mocks.signMessage.mockRejectedValue(new HardwareWalletError('disconnected'));

    await act(async () => {
      await context.signMessage();
    });

    expect(mocks.toDeviceDisconnectStep).toHaveBeenCalledOnce();
    expect(mocks.toErrorStep).not.toHaveBeenCalled();
    expect(mocks.close).toHaveBeenCalledOnce();
  });

  test('shows the error step and closes the session once when signing throws', async () => {
    const { context } = setupSignMessage();
    mocks.signMessage.mockRejectedValue(new Error('device unplugged'));

    await act(async () => {
      await context.signMessage();
    });

    expect(mocks.toErrorStep).toHaveBeenCalledWith('stacks');
    expect(mocks.toDeviceDisconnectStep).not.toHaveBeenCalled();
    expect(mocks.close).toHaveBeenCalledOnce();
  });
});
