// @vitest-environment jsdom
import { act, createElement } from 'react';
import { createRoot } from 'react-dom/client';

import { LedgerError } from '@zondax/ledger-stacks';

import { LedgerSignJwtContainer } from './ledger-sign-jwt-container';
import { LedgerJwtSigningContext } from './ledger-sign-jwt.context';

Reflect.set(globalThis, 'IS_REACT_ACT_ENVIRONMENT', true);

const mocks = vi.hoisted(() => ({
  toConnectionSuccessStep: vi.fn(),
  toAwaitingDeviceOperation: vi.fn(),
  toOperationRejectedStep: vi.fn(),
  toDeviceDisconnectStep: vi.fn(),
  toStacksAppOutdatedWarning: vi.fn(),
  toErrorStep: vi.fn(),
  cancelLedgerAction: vi.fn(),
  prepareConnection: vi.fn(),
  getStacksAppVersion: vi.fn(),
  versionGate: vi.fn(),
  signJwtHash: vi.fn(),
  makeAuthResponsePayload: vi.fn(),
  finalizeAuthResponse: vi.fn(),
  switchAccount: vi.fn(),
  dispatch: vi.fn(),
  getLegacyBitcoinAddresses: vi.fn(),
  captureContext: vi.fn<(value: LedgerJwtSigningContext) => void>(),
}));

vi.mock('react-router', async importOriginal => {
  const actual = await importOriginal<typeof import('react-router')>();
  return { ...actual, useLocation: () => ({ state: { index: '0' } }) };
});

vi.mock('react-redux', () => ({
  useDispatch: () => mocks.dispatch,
}));

vi.mock('../../hooks/use-ledger-navigate', () => ({
  useLedgerNavigate: () => ({
    toConnectionSuccessStep: mocks.toConnectionSuccessStep,
    toAwaitingDeviceOperation: mocks.toAwaitingDeviceOperation,
    toOperationRejectedStep: mocks.toOperationRejectedStep,
    toDeviceDisconnectStep: mocks.toDeviceDisconnectStep,
    toStacksAppOutdatedWarning: mocks.toStacksAppOutdatedWarning,
    toErrorStep: mocks.toErrorStep,
    cancelLedgerAction: mocks.cancelLedgerAction,
  }),
}));

vi.mock('@app/common/hooks/use-scroll-lock', () => ({
  useScrollLock: vi.fn(),
}));

vi.mock('@app/common/hooks/auth/use-onboarding-state', () => ({
  useOnboardingState: () => ({
    decodedAuthRequest: { domain_name: 'https://app.example.com' },
    authRequest: 'auth-request-token',
  }),
}));

vi.mock('@app/common/hooks/use-default-request-search-params', () => ({
  useDefaultRequestParams: () => ({ origin: 'https://app.example.com', tabId: 1, frameId: 0 }),
}));

vi.mock('@app/common/hooks/use-key-actions', () => ({
  useKeyActions: () => ({ switchAccount: mocks.switchAccount }),
}));

vi.mock('@app/common/authentication/use-legacy-auth-bitcoin-addresses', () => ({
  useGetLegacyAuthBitcoinAddresses: () => mocks.getLegacyBitcoinAddresses,
}));

vi.mock('@app/common/unsafe-auth-response', () => ({
  makeLedgerCompatibleUnsignedAuthResponsePayload: mocks.makeAuthResponsePayload,
}));

vi.mock('@shared/actions/finalize-auth-response', () => ({
  finalizeAuthResponse: mocks.finalizeAuthResponse,
}));

vi.mock('@app/store/accounts/blockchain/stacks/stacks-account.hooks', () => ({
  useCurrentStacksAccount: () => ({
    dataPublicKey: '029f9d43e161b2ecb86d78262d47d2cd10d20ab7b4c303cd4f0e26744c72e340fc',
    stxPublicKey: '029f9d43e161b2ecb86d78262d47d2cd10d20ab7b4c303cd4f0e26744c72e340fc',
    fingerprint: 'abcd1234',
  }),
}));

vi.mock('@app/store/app-permissions/app-permissions.slice', () => ({
  appPermissionsSlice: {
    actions: {
      updatePermission: (payload: unknown) => ({
        type: 'appPermissions/updatePermission',
        payload,
      }),
    },
  },
}));

vi.mock('@app/store/networks/networks.hooks', () => ({
  useCurrentStacksNetworkState: () => 'testnet',
}));

vi.mock('@app/store/networks/networks.selectors', () => ({
  useCurrentNetwork: () => ({ chain: { bitcoin: { mode: 'mainnet' } } }),
}));

vi.mock('@app/features/ledger/utils/stacks-ledger-utils', async importOriginal => {
  const actual =
    await importOriginal<typeof import('@app/features/ledger/utils/stacks-ledger-utils')>();
  return {
    ...actual,
    prepareLedgerDeviceStacksAppConnection: mocks.prepareConnection,
    getStacksAppVersion: mocks.getStacksAppVersion,
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

vi.mock('./jwt-signing.utils', () => ({
  getSha256HashOfJwtAuthPayload: () => 'deadbeef',
  signLedgerJwtHash: mocks.signJwtHash,
  addSignatureToAuthResponseJwt: () => 'signed.jwt.token',
}));

vi.mock('./ledger-sign-jwt.context', async importOriginal => {
  const actual = await importOriginal<typeof import('./ledger-sign-jwt.context')>();
  return {
    ...actual,
    LedgerJwtSigningProvider(props: { value: LedgerJwtSigningContext }) {
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

function renderSignJwtContext(): LedgerJwtSigningContext {
  const root = createRoot(document.createElement('div'));
  act(() => {
    root.render(createElement(LedgerSignJwtContainer));
  });
  const call = mocks.captureContext.mock.calls.at(-1);
  if (!call) throw new Error('JWT signing context was not rendered');
  return call[0];
}

function setupSignJwt() {
  const transportClose = vi.fn().mockResolvedValue(undefined);
  mocks.prepareConnection.mockResolvedValue({ transport: { close: transportClose } });
  mocks.getStacksAppVersion.mockResolvedValue(stacksAppVersion);
  mocks.versionGate.mockResolvedValue(true);
  mocks.getLegacyBitcoinAddresses.mockReturnValue({});
  mocks.makeAuthResponsePayload.mockReturnValue('unsigned.jwt.payload');
  mocks.signJwtHash.mockReturnValue(() =>
    Promise.resolve({ returnCode: LedgerError.NoErrors, signatureDER: Buffer.alloc(70, 1) })
  );
  return { transportClose, context: renderSignJwtContext() };
}

describe(LedgerSignJwtContainer.name, () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('signs the auth response, finalizes it and closes the transport once', async () => {
    const { transportClose, context } = setupSignJwt();

    await act(async () => {
      await context.signJwtPayload();
    });

    expect(mocks.finalizeAuthResponse).toHaveBeenCalledOnce();
    expect(mocks.switchAccount).toHaveBeenCalledOnce();
    expect(mocks.toDeviceDisconnectStep).not.toHaveBeenCalled();
    expect(transportClose).toHaveBeenCalledOnce();
  });

  test('stops before signing and closes the transport once when the version gate fails', async () => {
    const { transportClose, context } = setupSignJwt();
    mocks.versionGate.mockResolvedValue(false);

    await act(async () => {
      await context.signJwtPayload();
    });

    expect(mocks.signJwtHash).not.toHaveBeenCalled();
    expect(mocks.finalizeAuthResponse).not.toHaveBeenCalled();
    expect(transportClose).toHaveBeenCalledOnce();
  });

  test('stops before signing and closes the transport once when the device is locked', async () => {
    const { transportClose, context } = setupSignJwt();
    mocks.getStacksAppVersion.mockResolvedValue({ ...stacksAppVersion, deviceLocked: true });

    await act(async () => {
      await context.signJwtPayload();
    });

    expect(mocks.versionGate).not.toHaveBeenCalled();
    expect(mocks.signJwtHash).not.toHaveBeenCalled();
    expect(transportClose).toHaveBeenCalledOnce();
  });

  test('stops before signing and closes the transport once when the device reports an error', async () => {
    const { transportClose, context } = setupSignJwt();
    mocks.getStacksAppVersion.mockResolvedValue({
      ...stacksAppVersion,
      returnCode: LedgerError.UnknownError,
    });

    await act(async () => {
      await context.signJwtPayload();
    });

    expect(mocks.signJwtHash).not.toHaveBeenCalled();
    expect(mocks.finalizeAuthResponse).not.toHaveBeenCalled();
    expect(transportClose).toHaveBeenCalledOnce();
  });

  test('shows the rejection step and closes the transport once when signing is rejected', async () => {
    const { transportClose, context } = setupSignJwt();
    mocks.signJwtHash.mockReturnValue(() =>
      Promise.resolve({ returnCode: LedgerError.TransactionRejected })
    );

    await act(async () => {
      await context.signJwtPayload();
    });

    expect(mocks.toOperationRejectedStep).toHaveBeenCalledOnce();
    expect(mocks.finalizeAuthResponse).not.toHaveBeenCalled();
    expect(transportClose).toHaveBeenCalledOnce();
  });

  test('shows the disconnect step and closes the transport once when signing throws', async () => {
    const { transportClose, context } = setupSignJwt();
    mocks.signJwtHash.mockReturnValue(() => Promise.reject(new Error('device unplugged')));

    await act(async () => {
      await context.signJwtPayload();
    });

    expect(mocks.toDeviceDisconnectStep).toHaveBeenCalledOnce();
    expect(transportClose).toHaveBeenCalledOnce();
  });
});
