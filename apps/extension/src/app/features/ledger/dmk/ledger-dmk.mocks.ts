import { DeviceManagementKit } from '@ledgerhq/device-management-kit';
import { vi } from 'vitest';

function createDmkInstance(): DeviceManagementKit {
  const dmk: unknown = Object.create(DeviceManagementKit.prototype);
  if (!(dmk instanceof DeviceManagementKit)) throw new Error('Failed to create fake DMK');
  return dmk;
}

export function makeFakeDmk(overrides: Partial<DeviceManagementKit> = {}): DeviceManagementKit {
  const dmk = createDmkInstance();
  return Object.assign(dmk, {
    connect: vi.fn(),
    disconnect: vi.fn().mockResolvedValue(undefined),
    sendApdu: vi.fn(),
    sendCommand: vi.fn(),
    executeDeviceAction: vi.fn(),
    listenToAvailableDevices: vi.fn(),
    startDiscovering: vi.fn(),
    stopDiscovering: vi.fn().mockResolvedValue(undefined),
    ...overrides,
  });
}
