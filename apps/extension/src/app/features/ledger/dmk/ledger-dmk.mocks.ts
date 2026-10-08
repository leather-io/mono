import { DeviceManagementKit } from '@ledgerhq/device-management-kit';
import { vi } from 'vitest';

export function makeFakeDmk(overrides: Partial<DeviceManagementKit> = {}): DeviceManagementKit {
  const dmk: DeviceManagementKit = Object.create(DeviceManagementKit.prototype);
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
