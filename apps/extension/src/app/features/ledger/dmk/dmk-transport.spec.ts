import { DeviceManagementKit } from '@ledgerhq/device-management-kit';

import { DmkTransport } from './dmk-transport';

const sessionId = 'session-1';

interface FakeApduResponse {
  data: number[];
  statusCode: number[];
}
function makeFakeDmk({ data, statusCode }: FakeApduResponse) {
  const dmk: DeviceManagementKit = Object.create(DeviceManagementKit.prototype);
  dmk.sendApdu = vi.fn().mockResolvedValue({
    data: Uint8Array.from(data),
    statusCode: Uint8Array.from(statusCode),
  });
  dmk.disconnect = vi.fn().mockResolvedValue(undefined);
  return dmk;
}

describe(DmkTransport.name, () => {
  test('frames the APDU with a length byte and returns data followed by the status word', async () => {
    const dmk = makeFakeDmk({ data: [0x01, 0x02], statusCode: [0x90, 0x00] });
    const transport = new DmkTransport(dmk, sessionId);

    const response = await transport.send(0xe0, 0x01, 0x02, 0x03, Buffer.from([0xaa, 0xbb]));

    expect(dmk.sendApdu).toHaveBeenCalledWith({
      sessionId,
      apdu: Uint8Array.from([0xe0, 0x01, 0x02, 0x03, 0x02, 0xaa, 0xbb]),
    });
    expect([...response]).toEqual([0x01, 0x02, 0x90, 0x00]);
  });

  test('rejects with the status code when the status word is not accepted', async () => {
    const dmk = makeFakeDmk({ data: [], statusCode: [0x69, 0x85] });
    const transport = new DmkTransport(dmk, sessionId);

    await expect(transport.send(0xe0, 0x01, 0x00, 0x00)).rejects.toMatchObject({
      statusCode: 0x6985,
    });
  });

  test('maps the locked-device status word to a LockedDeviceError', async () => {
    const dmk = makeFakeDmk({ data: [], statusCode: [0x55, 0x15] });
    const transport = new DmkTransport(dmk, sessionId);

    await expect(transport.send(0xe0, 0x01, 0x00, 0x00)).rejects.toMatchObject({
      name: 'LockedDeviceError',
      statusCode: 0x5515,
    });
  });

  test('resolves when the status word is in the accepted list', async () => {
    const dmk = makeFakeDmk({ data: [0x07], statusCode: [0xe0, 0x00] });
    const transport = new DmkTransport(dmk, sessionId);

    const response = await transport.send(
      0xe0,
      0x01,
      0x00,
      0x00,
      Buffer.alloc(0),
      [0x9000, 0xe000]
    );

    expect([...response]).toEqual([0x07, 0xe0, 0x00]);
  });

  test('disconnects the session once even when closed twice', async () => {
    const dmk = makeFakeDmk({ data: [], statusCode: [0x90, 0x00] });
    const transport = new DmkTransport(dmk, sessionId);

    await transport.close();
    await transport.close();

    expect(dmk.disconnect).toHaveBeenCalledOnce();
    expect(dmk.disconnect).toHaveBeenCalledWith({ sessionId });
  });
});
