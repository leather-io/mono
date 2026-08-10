// @vitest-environment jsdom
import { act, createElement } from 'react';
import { createRoot } from 'react-dom/client';

import { LedgerError } from '@zondax/ledger-stacks';

import { LedgerSignMsgContainer } from './ledger-stacks-sign-msg-container';
import { LedgerMessageSigningContext } from './ledger-stacks-sign-msg.context';

Reflect.set(globalThis, 'IS_REACT_ACT_ENVIRONMENT', true);

const mocks = vi.hoisted(() => ({
  toCheckingAppVersion: vi.fn(),
  toConnectionSuccessStep: vi.fn(),
  toAwaitingDeviceOperation: vi.fn(),
  toDevicePayloadInvalid: vi.fn(),
  toOperationRejectedStep: vi.fn(),
  toDeviceDisconnectStep: vi.fn(),
  toStacksAppOutdatedWarning: vi.fn(),
  toErrorStep: vi.fn(),
  trackDeviceVersionInfo: vi.fn(),
  messageSignedOnLedgerSuccessfully: vi.fn(),
  messageSignedOnLedgerRejected: vi.fn(),
  prepareConnection: vi.fn(),
  getStacksAppVersion: vi.fn(),
  signUtf8Message: vi.fn(),
  versionGate: vi.fn(),
  migrateFingerprint: vi.fn(),
  publish: vi.fn(),
  captureContext: vi.fn<(value: LedgerMessageSigningContext) => void>(),
}));

vi.mock('../../hooks/use-ledger-navigate', () => ({
  useLedgerNavigate: () => ({
    toCheckingAppVersion: mocks.toCheckingAppVersion,
    toConnectionSuccessStep: mocks.toConnectionSuccessStep,
    toAwaitingDeviceOperation: mocks.toAwaitingDeviceOperation,
    toDevicePayloadInvalid: mocks.toDevicePayloadInvalid,
    toOperationRejectedStep: mocks.toOperationRejectedStep,
    toDeviceDisconnectStep: mocks.toDeviceDisconnectStep,
    toStacksAppOutdatedWarning: mocks.toStacksAppOutdatedWarning,
    toErrorStep: mocks.toErrorStep,
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

vi.mock('@app/common/publish-subscribe', () => ({
  appEvents: { publish: mocks.publish },
}));

vi.mock('@app/store/accounts/blockchain/stacks/stacks-account.hooks', () => ({
  useCurrentStacksAccount: () => ({
    derivationPath: "m/44'/5757'/0'/0/0",
    stxPublicKey: '029f9d43e161b2ecb86d78262d47d2cd10d20ab7b4c303cd4f0e26744c72e340fc',
  }),
}));

vi.mock('./use-message-type', () => ({
  useUnsignedMessageType: () => ({ messageType: 'utf8', message: 'hello leather' }),
}));

vi.mock('@app/features/ledger/utils/stacks-ledger-utils', async importOriginal => {
  const actual =
    await importOriginal<typeof import('@app/features/ledger/utils/stacks-ledger-utils')>();
  return {
    ...actual,
    prepareLedgerDeviceStacksAppConnection: mocks.prepareConnection,
    getStacksAppVersion: mocks.getStacksAppVersion,
    signLedgerStacksUtf8Message: mocks.signUtf8Message,
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

vi.mock('@leather.io/ui', () => ({
  Sheet: () => null,
  SheetHeader: () => null,
}));

vi.mock('@leather.io/utils', async importOriginal => {
  const actual = await importOriginal<typeof import('@leather.io/utils')>();
  return { ...actual, delay: () => Promise.resolve() };
});

vi.mock('./ledger-stacks-sign-msg.context', async importOriginal => {
  const actual = await importOriginal<typeof import('./ledger-stacks-sign-msg.context')>();
  return {
    ...actual,
    LedgerMsgSigningProvider(props: { value: LedgerMessageSigningContext }) {
      mocks.captureContext(props.value);
      return null;
    },
  };
});

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

function renderSignMsgContext(): LedgerMessageSigningContext {
  const root = createRoot(document.createElement('div'));
  act(() => {
    root.render(createElement(LedgerSignMsgContainer));
  });
  const call = mocks.captureContext.mock.calls.at(-1);
  if (!call) throw new Error('Message signing context was not rendered');
  return call[0];
}

function setupSignMessage() {
  const transportClose = vi.fn().mockResolvedValue(undefined);
  mocks.prepareConnection.mockResolvedValue({ transport: { close: transportClose } });
  mocks.getStacksAppVersion.mockResolvedValue(stacksAppVersion);
  mocks.versionGate.mockResolvedValue(true);
  mocks.migrateFingerprint.mockResolvedValue(undefined);
  mocks.signUtf8Message.mockReturnValue(() =>
    Promise.resolve({ returnCode: LedgerError.NoErrors, signatureVRS: Buffer.alloc(65, 1) })
  );
  return { transportClose, context: renderSignMsgContext() };
}

describe(LedgerSignMsgContainer.name, () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('signs the message, publishes the signature and closes the transport once', async () => {
    const { transportClose, context } = setupSignMessage();

    await act(async () => {
      await context.signMessage();
    });

    expect(mocks.messageSignedOnLedgerSuccessfully).toHaveBeenCalledOnce();
    expect(mocks.publish).toHaveBeenCalledOnce();
    expect(mocks.publish.mock.calls[0][0]).toBe('ledgerStacksMessageSigned');
    expect(mocks.toDeviceDisconnectStep).not.toHaveBeenCalled();
    expect(transportClose).toHaveBeenCalledOnce();
  });

  test('stops before signing and closes the transport once when the version gate fails', async () => {
    const { transportClose, context } = setupSignMessage();
    mocks.versionGate.mockResolvedValue(false);

    await act(async () => {
      await context.signMessage();
    });

    expect(mocks.signUtf8Message).not.toHaveBeenCalled();
    expect(mocks.publish).not.toHaveBeenCalled();
    expect(transportClose).toHaveBeenCalledOnce();
  });

  test('stops before signing and closes the transport once when the device is locked', async () => {
    const { transportClose, context } = setupSignMessage();
    mocks.getStacksAppVersion.mockResolvedValue({ ...stacksAppVersion, deviceLocked: true });

    await act(async () => {
      await context.signMessage();
    });

    expect(mocks.versionGate).not.toHaveBeenCalled();
    expect(mocks.signUtf8Message).not.toHaveBeenCalled();
    expect(transportClose).toHaveBeenCalledOnce();
  });

  test('publishes a cancellation and closes the transport once when signing is rejected', async () => {
    const { transportClose, context } = setupSignMessage();
    mocks.signUtf8Message.mockReturnValue(() =>
      Promise.resolve({ returnCode: LedgerError.TransactionRejected })
    );

    await act(async () => {
      await context.signMessage();
    });

    expect(mocks.toOperationRejectedStep).toHaveBeenCalledOnce();
    expect(mocks.messageSignedOnLedgerRejected).toHaveBeenCalledOnce();
    expect(mocks.publish).toHaveBeenCalledOnce();
    expect(mocks.publish.mock.calls[0][0]).toBe('ledgerStacksMessageSigningCancelled');
    expect(transportClose).toHaveBeenCalledOnce();
  });

  test('shows the disconnect step and closes the transport once when signing throws', async () => {
    const { transportClose, context } = setupSignMessage();
    mocks.signUtf8Message.mockReturnValue(() => Promise.reject(new Error('device unplugged')));

    await act(async () => {
      await context.signMessage();
    });

    expect(mocks.toDeviceDisconnectStep).toHaveBeenCalledOnce();
    expect(transportClose).toHaveBeenCalledOnce();
  });
});
