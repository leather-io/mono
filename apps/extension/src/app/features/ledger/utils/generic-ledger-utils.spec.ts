import { LockedDeviceError, StatusCodes, TransportStatusError } from '@ledgerhq/errors';

import {
  LEDGER_APPS_MAP,
  isLedgerUserDeniedError,
  promptOpenAppOnDevice,
} from './generic-ledger-utils';

const mocks = vi.hoisted(() => ({
  create: vi.fn(),
  list: vi.fn(),
  getAppAndVersion: vi.fn(),
  delay: vi.fn<(ms: number) => Promise<void>>(() => Promise.resolve()),
  warn: vi.fn(),
}));

vi.mock('@ledgerhq/hw-transport-webusb', () => ({
  default: { create: mocks.create, list: mocks.list },
}));

vi.mock('@ledgerhq/ledger-bitcoin', () => ({
  default: vi.fn(() => ({ getAppAndVersion: mocks.getAppAndVersion })),
}));

vi.mock('@leather.io/utils', async importOriginal => {
  const actual = await importOriginal<typeof import('@leather.io/utils')>();
  return { ...actual, delay: mocks.delay };
});

vi.mock('@shared/logger', () => ({
  logger: { warn: mocks.warn },
}));

interface FakeTransport {
  send: ReturnType<typeof vi.fn>;
  close: ReturnType<typeof vi.fn>;
}

function makeFakeTransport(): FakeTransport {
  return {
    send: vi.fn().mockResolvedValue(undefined),
    close: vi.fn().mockResolvedValue(undefined),
  };
}

const openStacksAppApdu = [0xe0, 0xd8, 0x00, 0x00, Buffer.from('Stacks', 'ascii')];
const quitAppApdu = [0xb0, 0xa7, 0x00, 0x00];

describe(promptOpenAppOnDevice.name, () => {
  let transports: FakeTransport[] = [];

  beforeEach(() => {
    vi.clearAllMocks();
    transports = [];
    mocks.create.mockImplementation(() => {
      const transport = makeFakeTransport();
      transports.push(transport);
      return Promise.resolve(transport);
    });
    mocks.list.mockImplementation(() => Promise.resolve([{}]));
  });

  test('settles without opening further transports when the requested app is already open', async () => {
    mocks.getAppAndVersion.mockResolvedValue({ name: LEDGER_APPS_MAP.STACKS });

    await promptOpenAppOnDevice(LEDGER_APPS_MAP.STACKS);

    expect(mocks.create).toHaveBeenCalledOnce();
    expect(transports[0].close).toHaveBeenCalledOnce();
    expect(transports[0].send).not.toHaveBeenCalled();
    expect(mocks.list).not.toHaveBeenCalled();
    expect(mocks.delay).toHaveBeenCalledOnce();
    expect(mocks.delay).toHaveBeenCalledWith(500);
  });

  test('quits the open app before opening the requested one', async () => {
    mocks.getAppAndVersion.mockResolvedValue({ name: LEDGER_APPS_MAP.BITCOIN_MAINNET });

    await promptOpenAppOnDevice(LEDGER_APPS_MAP.STACKS);

    expect(mocks.create).toHaveBeenCalledTimes(3);
    expect(transports[1].send).toHaveBeenCalledWith(...quitAppApdu);
    expect(transports[2].send).toHaveBeenCalledWith(...openStacksAppApdu);
  });

  test('skips quitting when the device is on the main menu', async () => {
    mocks.getAppAndVersion.mockResolvedValue({ name: LEDGER_APPS_MAP.MAIN_MENU });

    await promptOpenAppOnDevice(LEDGER_APPS_MAP.STACKS);

    expect(mocks.create).toHaveBeenCalledTimes(2);
    expect(transports[1].send).toHaveBeenCalledWith(...openStacksAppApdu);
  });

  test('only closes the probe transport, never the app-switching ones', async () => {
    mocks.getAppAndVersion.mockResolvedValue({ name: LEDGER_APPS_MAP.BITCOIN_MAINNET });

    await promptOpenAppOnDevice(LEDGER_APPS_MAP.STACKS);

    expect(transports[0].close).toHaveBeenCalledOnce();
    expect(transports[1].close).not.toHaveBeenCalled();
    expect(transports[2].close).not.toHaveBeenCalled();
  });

  test('closes the probe transport when reading the open app fails', async () => {
    mocks.getAppAndVersion.mockRejectedValue(new Error('disconnected'));

    await expect(promptOpenAppOnDevice(LEDGER_APPS_MAP.STACKS)).rejects.toThrow('disconnected');

    expect(mocks.create).toHaveBeenCalledOnce();
    expect(transports[0].close).toHaveBeenCalledOnce();
  });

  test('still resolves when closing a transport fails', async () => {
    mocks.getAppAndVersion.mockResolvedValue({ name: LEDGER_APPS_MAP.MAIN_MENU });
    mocks.create.mockImplementation(() => {
      const transport = makeFakeTransport();
      transport.close.mockRejectedValue(new Error('already closed'));
      transports.push(transport);
      return Promise.resolve(transport);
    });

    await expect(promptOpenAppOnDevice(LEDGER_APPS_MAP.STACKS)).resolves.toBeUndefined();

    expect(mocks.warn).toHaveBeenCalled();
  });

  test('resolves when the device disconnects while the open app apdu is in flight', async () => {
    mocks.getAppAndVersion.mockResolvedValue({ name: LEDGER_APPS_MAP.MAIN_MENU });
    mocks.create
      .mockImplementationOnce(() => {
        const transport = makeFakeTransport();
        transports.push(transport);
        return Promise.resolve(transport);
      })
      .mockImplementationOnce(() => {
        const transport = makeFakeTransport();
        transport.send.mockRejectedValue(new Error('The device was disconnected.'));
        transports.push(transport);
        return Promise.resolve(transport);
      });

    await expect(promptOpenAppOnDevice(LEDGER_APPS_MAP.STACKS)).resolves.toBeUndefined();

    expect(transports[1].close).not.toHaveBeenCalled();
  });

  test('closes the transport and throws an app-open failure when opening the app fails for another reason', async () => {
    mocks.getAppAndVersion.mockResolvedValue({ name: LEDGER_APPS_MAP.MAIN_MENU });
    mocks.create
      .mockImplementationOnce(() => {
        const transport = makeFakeTransport();
        transports.push(transport);
        return Promise.resolve(transport);
      })
      .mockImplementationOnce(() => {
        const transport = makeFakeTransport();
        transport.send.mockRejectedValue(new Error('Condition of use not satisfied'));
        transports.push(transport);
        return Promise.resolve(transport);
      });

    const promptPromise = promptOpenAppOnDevice(LEDGER_APPS_MAP.STACKS);
    await expect(promptPromise).rejects.toThrow('Unable to open the Stacks app on your Ledger');
    await expect(promptPromise).rejects.toMatchObject({ name: 'AppOpenFailed' });

    expect(transports[1].close).toHaveBeenCalledOnce();
  });

  test('polls until a re-enumerated device appears before resolving', async () => {
    mocks.getAppAndVersion.mockResolvedValue({ name: LEDGER_APPS_MAP.MAIN_MENU });
    const staleDevice = {};
    mocks.list
      .mockResolvedValueOnce([staleDevice])
      .mockResolvedValueOnce([staleDevice])
      .mockResolvedValueOnce([staleDevice])
      .mockResolvedValue([{}]);

    await promptOpenAppOnDevice(LEDGER_APPS_MAP.STACKS);

    expect(mocks.list).toHaveBeenCalledTimes(4);
    expect(mocks.delay.mock.calls.filter(([ms]) => ms === 100)).toHaveLength(2);
  });

  test('gives up waiting for re-enumeration after the timeout', async () => {
    mocks.getAppAndVersion.mockResolvedValue({ name: LEDGER_APPS_MAP.MAIN_MENU });
    const staleDevice = {};
    mocks.list.mockResolvedValue([staleDevice]);

    await expect(promptOpenAppOnDevice(LEDGER_APPS_MAP.STACKS)).resolves.toBeUndefined();

    expect(mocks.delay.mock.calls.filter(([ms]) => ms === 100)).toHaveLength(50);
  });
});

describe(isLedgerUserDeniedError.name, () => {
  test('matches the device denial status code', () => {
    expect(
      isLedgerUserDeniedError(new TransportStatusError(StatusCodes.CONDITIONS_OF_USE_NOT_SATISFIED))
    ).toBe(true);
  });

  test('does not match other device status codes', () => {
    expect(isLedgerUserDeniedError(new TransportStatusError(StatusCodes.INCORRECT_DATA))).toBe(
      false
    );
    expect(isLedgerUserDeniedError(new LockedDeviceError())).toBe(false);
  });

  test('does not match errors that merely mention the status code', () => {
    expect(isLedgerUserDeniedError(new Error('Ledger device: UNKNOWN_ERROR (0x6985)'))).toBe(false);
    expect(isLedgerUserDeniedError(undefined)).toBe(false);
  });
});
