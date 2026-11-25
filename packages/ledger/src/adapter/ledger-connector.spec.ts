import {
  CommandResultFactory,
  DeviceActionStatus,
  DeviceModel,
  DeviceModelId,
  type DiscoveredDevice,
  type OpenAppDAState,
  UserInteractionRequired,
} from '@ledgerhq/device-management-kit';
import { LedgerError } from '@zondax/ledger-stacks';
import { firstValueFrom, of } from 'rxjs';

import { makeFakeLedgerStacksApp } from '../app/ledger-app.test-utils';
import type { DeviceChooser } from '../contract/hardware-wallet-connector';
import { makeFakeDmk } from '../dmk/ledger-dmk.test-utils';
import type * as StacksLedgerUtils from '../stacks/stacks-ledger-utils';
import { createLedgerConnector } from './ledger-connector';

const mocks = vi.hoisted(() => ({ connectStacksApp: vi.fn(), buildDmk: vi.fn() }));

vi.mock('../stacks/stacks-ledger-utils', async importOriginal => {
  const actual = await importOriginal<typeof StacksLedgerUtils>();
  return { ...actual, connectLedgerStacksApp: mocks.connectStacksApp };
});

const sessionId = 'session-1';
const transportIdentifier = 'FAKE-TRANSPORT';
const transportFactory = vi.fn();

const device: DiscoveredDevice = {
  id: 'device-1',
  name: 'Nano S Plus',
  deviceModel: new DeviceModel({
    id: 'nanoSP',
    model: DeviceModelId.NANO_SP,
    name: 'Ledger Nano S Plus',
  }),
  transport: transportIdentifier,
};

const completedState: OpenAppDAState = { status: DeviceActionStatus.Completed, output: undefined };

const unlockDeviceState: OpenAppDAState = {
  status: DeviceActionStatus.Pending,
  intermediateValue: {
    requiredUserInteraction: UserInteractionRequired.UnlockDevice,
    step: 'os.openApp.steps.getDeviceStatus',
  },
};

const confirmOpenAppState: OpenAppDAState = {
  status: DeviceActionStatus.Pending,
  intermediateValue: {
    requiredUserInteraction: UserInteractionRequired.ConfirmOpenApp,
    step: 'os.openApp.steps.confirmOpenApp',
  },
};

interface FakeDmkOptions {
  grantedDevices?: DiscoveredDevice[];
  openAppStates?: OpenAppDAState[];
  appName?: string;
}
function makeConnectingDmk({
  grantedDevices = [device],
  openAppStates = [completedState],
  appName = 'Bitcoin',
}: FakeDmkOptions = {}) {
  const startDiscovering = vi.fn().mockReturnValue(of(device));
  const connect = vi.fn().mockResolvedValue(sessionId);
  const disconnect = vi.fn().mockResolvedValue(undefined);
  const sendCommand = vi
    .fn()
    .mockResolvedValue(
      CommandResultFactory({ data: { name: appName, version: '2.4.1', flags: 0 } })
    );
  const executeDeviceAction = vi
    .fn()
    .mockReturnValue({ observable: of(...openAppStates), cancel: vi.fn() });
  const dmk = makeFakeDmk({
    listenToAvailableDevices: vi.fn().mockReturnValue(of(grantedDevices)),
    startDiscovering,
    stopDiscovering: vi.fn().mockResolvedValue(undefined),
    connect,
    disconnect,
    sendCommand,
    executeDeviceAction,
    getConnectedDevice: vi
      .fn()
      .mockReturnValue({ id: device.id, name: device.name, modelId: DeviceModelId.NANO_SP }),
  });
  return { dmk, startDiscovering, connect, disconnect, executeDeviceAction };
}

const masterFingerprintHex = 'deadbeef';

function makeStacksFingerprintResponse() {
  return {
    returnCode: LedgerError.NoErrors,
    errorMessage: 'No errors',
    fingerprint: Buffer.from(masterFingerprintHex, 'hex'),
  };
}

vi.mock('../dmk/ledger-dmk', () => ({
  buildLedgerDmk: mocks.buildDmk,
}));

function makeConnector(options: Partial<Parameters<typeof createLedgerConnector>[0]> = {}) {
  return createLedgerConnector({ transportFactory, transportIdentifier, ...options });
}

function makeStacksVersion(minor: number, patch: number) {
  return {
    returnCode: LedgerError.NoErrors,
    errorMessage: 'No errors',
    testMode: false,
    major: 0,
    minor,
    patch,
    deviceLocked: false,
    targetId: '',
  };
}

describe(createLedgerConnector.name, () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('builds the kit with the given transport and exposes the Ledger capabilities', () => {
    const connector = makeConnector();

    expect(connector.vendor).toBe('ledger');
    expect(connector.capabilities).toMatchObject({
      bitcoin: { taproot: true, descriptorPolicies: true },
      stacks: { structuredMessages: true },
      addressVerification: true,
    });
    expect(mocks.buildDmk).not.toHaveBeenCalled();
  });

  test('connects to the Bitcoin app and returns a session with a Bitcoin signer', async () => {
    const { dmk, connect, disconnect } = makeConnectingDmk();
    mocks.buildDmk.mockReturnValue(dmk);

    const session = await makeConnector().connect({ chain: 'bitcoin', network: 'mainnet' }, {});

    expect(mocks.buildDmk).toHaveBeenCalledWith(transportFactory);
    expect(connect).toHaveBeenCalledWith(expect.objectContaining({ device }));
    expect(session.wallet.bitcoin).not.toBeNull();
    expect(session.wallet.stacks).toBeNull();
    expect(session.wallet.capabilities).toBe(makeConnector().capabilities);
    expect(session.app).toEqual({ name: 'Bitcoin', version: '2.4.1' });
    expect(session.device).toEqual({
      id: 'device-1',
      name: 'Nano S Plus',
      model: DeviceModelId.NANO_SP,
    });
    expect(disconnect).not.toHaveBeenCalled();

    await session.close();
    await session.close();

    expect(disconnect).toHaveBeenCalledOnce();
    expect(disconnect).toHaveBeenCalledWith({ sessionId });
  });

  test('forwards open-app interactions with the app name', async () => {
    const { dmk } = makeConnectingDmk({
      appName: 'Bitcoin Test',
      openAppStates: [unlockDeviceState, confirmOpenAppState, completedState],
    });
    mocks.buildDmk.mockReturnValue(dmk);
    const onInteraction = vi.fn();

    await makeConnector().connect({ chain: 'bitcoin', network: 'testnet' }, { onInteraction });

    expect(onInteraction.mock.calls).toEqual([
      [{ type: 'unlock-device' }],
      [{ type: 'open-app', appName: 'Bitcoin Test' }],
    ]);
  });

  test('closes the session and reports wrong-app when another app answers', async () => {
    const { dmk, disconnect } = makeConnectingDmk({ appName: 'Bitcoin Test' });
    mocks.buildDmk.mockReturnValue(dmk);

    await expect(
      makeConnector().connect({ chain: 'bitcoin', network: 'mainnet' }, {})
    ).rejects.toMatchObject({ kind: 'wrong-app' });

    expect(disconnect).toHaveBeenCalledWith({ sessionId });
  });

  test('reports not-paired instead of prompting when prompting is disallowed', async () => {
    const { dmk, startDiscovering, connect } = makeConnectingDmk({ grantedDevices: [] });
    mocks.buildDmk.mockReturnValue(dmk);

    await expect(
      makeConnector({ canPromptForDevice: () => false }).connect(
        { chain: 'bitcoin', network: 'mainnet' },
        {}
      )
    ).rejects.toMatchObject({ kind: 'not-paired' });

    expect(startDiscovering).not.toHaveBeenCalled();
    expect(connect).not.toHaveBeenCalled();
  });

  test('lets the chooser pick among discovered devices', async () => {
    const { dmk, connect } = makeConnectingDmk({ grantedDevices: [] });
    mocks.buildDmk.mockReturnValue(dmk);
    const choose = vi.fn<DeviceChooser['choose']>(candidates => firstValueFrom(candidates));

    await makeConnector({ chooseDevice: { choose } }).connect(
      { chain: 'bitcoin', network: 'mainnet' },
      {}
    );

    await expect(firstValueFrom(choose.mock.calls[0][0])).resolves.toEqual({
      id: 'device-1',
      name: 'Nano S Plus',
      model: DeviceModelId.NANO_SP,
    });
    expect(connect).toHaveBeenCalledWith(expect.objectContaining({ device }));
  });

  test('rejects with cancelled before touching the device when already aborted', async () => {
    const { dmk, connect } = makeConnectingDmk();
    mocks.buildDmk.mockReturnValue(dmk);
    const controller = new AbortController();
    controller.abort();

    await expect(
      makeConnector().connect(
        { chain: 'bitcoin', network: 'mainnet' },
        { signal: controller.signal }
      )
    ).rejects.toMatchObject({ kind: 'cancelled' });

    expect(connect).not.toHaveBeenCalled();
  });

  test('connects to the Stacks app and gates on the minimum app version', async () => {
    const { dmk, disconnect } = makeConnectingDmk();
    mocks.buildDmk.mockReturnValue(dmk);
    mocks.connectStacksApp.mockResolvedValue(
      makeFakeLedgerStacksApp({ getVersion: vi.fn().mockResolvedValue(makeStacksVersion(26, 17)) })
    );

    await expect(makeConnector().connect({ chain: 'stacks' }, {})).rejects.toMatchObject({
      kind: 'outdated-app',
      details: { currentVersion: '0.26.17', requiredVersion: '0.26.19' },
    });
    expect(disconnect).toHaveBeenCalledWith({ sessionId });
  });

  test('returns a Stacks signer once the app version passes the gate', async () => {
    const { dmk } = makeConnectingDmk();
    mocks.buildDmk.mockReturnValue(dmk);
    mocks.connectStacksApp.mockResolvedValue(
      makeFakeLedgerStacksApp({
        getVersion: vi.fn().mockResolvedValue(makeStacksVersion(26, 19)),
        getMasterFingerprint: vi.fn().mockResolvedValue(makeStacksFingerprintResponse()),
      })
    );

    const session = await makeConnector().connect({ chain: 'stacks' }, {});

    expect(session.wallet.stacks).not.toBeNull();
    expect(session.wallet.bitcoin).toBeNull();
    expect(session.app).toEqual({ name: 'Stacks', version: '0.26.19' });
    await expect(session.wallet.getMasterFingerprint({})).resolves.toBe(masterFingerprintHex);
    expect(mocks.connectStacksApp).toHaveBeenCalledWith(
      dmk,
      expect.objectContaining({ transport: transportIdentifier, canPromptForDevice: true })
    );
  });

  test('reports locked and closes the session when the Stacks app says the device is locked', async () => {
    const { dmk, disconnect } = makeConnectingDmk();
    mocks.buildDmk.mockReturnValue(dmk);
    mocks.connectStacksApp.mockResolvedValue(
      makeFakeLedgerStacksApp({
        getVersion: vi.fn().mockResolvedValue({ ...makeStacksVersion(26, 19), deviceLocked: true }),
      })
    );

    await expect(makeConnector().connect({ chain: 'stacks' }, {})).rejects.toMatchObject({
      kind: 'locked',
    });
    expect(disconnect).toHaveBeenCalledWith({ sessionId });
  });

  test('pairs a device without opening an app and releases it', async () => {
    const { dmk, connect, disconnect, executeDeviceAction } = makeConnectingDmk();
    mocks.buildDmk.mockReturnValue(dmk);

    const paired = await makeConnector().pair({});

    expect(paired).toEqual({ id: 'device-1', name: 'Nano S Plus', model: DeviceModelId.NANO_SP });
    expect(connect).toHaveBeenCalledOnce();
    expect(executeDeviceAction).not.toHaveBeenCalled();
    expect(disconnect).toHaveBeenCalledWith({ sessionId });
  });

  test('maps pairing failures to hardware wallet errors', async () => {
    const { dmk } = makeConnectingDmk({ grantedDevices: [] });
    mocks.buildDmk.mockReturnValue(dmk);

    await expect(makeConnector({ canPromptForDevice: () => false }).pair({})).rejects.toMatchObject(
      { kind: 'not-paired' }
    );
  });
});
