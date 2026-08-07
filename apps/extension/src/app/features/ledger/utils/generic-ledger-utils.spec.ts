import { LEDGER_APPS_MAP, promptOpenAppOnDevice } from './generic-ledger-utils';

const mocks = vi.hoisted(() => ({
  create: vi.fn(),
  getAppAndVersion: vi.fn(),
  delay: vi.fn(() => Promise.resolve()),
  warn: vi.fn(),
}));

vi.mock('@ledgerhq/hw-transport-webusb', () => ({
  default: { create: mocks.create },
}));

vi.mock('ledger-bitcoin', () => ({
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
  });

  test('settles without opening further transports when the requested app is already open', async () => {
    mocks.getAppAndVersion.mockResolvedValue({ name: LEDGER_APPS_MAP.STACKS });

    await promptOpenAppOnDevice(LEDGER_APPS_MAP.STACKS);

    expect(mocks.create).toHaveBeenCalledOnce();
    expect(transports[0].close).toHaveBeenCalledOnce();
    expect(transports[0].send).not.toHaveBeenCalled();
    expect(mocks.delay).toHaveBeenCalledOnce();
    expect(mocks.delay).toHaveBeenCalledWith(500);
  });

  test('quits the open app before opening the requested one', async () => {
    mocks.getAppAndVersion.mockResolvedValue({ name: LEDGER_APPS_MAP.BITCOIN_MAINNET });

    await promptOpenAppOnDevice(LEDGER_APPS_MAP.STACKS);

    expect(mocks.create).toHaveBeenCalledTimes(3);
    expect(transports[1].send).toHaveBeenCalledWith(...quitAppApdu);
    expect(transports[2].send).toHaveBeenCalledWith(...openStacksAppApdu);
    transports.forEach(transport => expect(transport.close).toHaveBeenCalledOnce());
  });

  test('skips quitting when the device is on the main menu', async () => {
    mocks.getAppAndVersion.mockResolvedValue({ name: LEDGER_APPS_MAP.MAIN_MENU });

    await promptOpenAppOnDevice(LEDGER_APPS_MAP.STACKS);

    expect(mocks.create).toHaveBeenCalledTimes(2);
    expect(transports[1].send).toHaveBeenCalledWith(...openStacksAppApdu);
    transports.forEach(transport => expect(transport.close).toHaveBeenCalledOnce());
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
});
