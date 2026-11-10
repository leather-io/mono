import {
  type DeviceManagementKit,
  DeviceManagementKitBuilder,
  type TransportFactory,
} from '@ledgerhq/device-management-kit';

export function buildLedgerDmk(transportFactory: TransportFactory): DeviceManagementKit {
  return new DeviceManagementKitBuilder().addTransport(transportFactory).build();
}
