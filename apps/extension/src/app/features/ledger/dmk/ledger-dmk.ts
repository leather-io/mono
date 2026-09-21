import {
  type DeviceManagementKit,
  DeviceManagementKitBuilder,
} from '@ledgerhq/device-management-kit';
import { webHidIdentifier, webHidTransportFactory } from '@ledgerhq/device-transport-kit-web-hid';

export const ledgerTransportIdentifier = webHidIdentifier;

export function buildLedgerDmk(): DeviceManagementKit {
  return new DeviceManagementKitBuilder().addTransport(webHidTransportFactory).build();
}
