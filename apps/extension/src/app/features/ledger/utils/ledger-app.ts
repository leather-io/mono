import type {
  DeviceActionIntermediateValue,
  DeviceSessionId,
  ExecuteDeviceActionReturnType,
} from '@ledgerhq/device-management-kit';
import type { SignerBtc } from '@ledgerhq/device-signer-kit-bitcoin';
import type StacksApp from '@zondax/ledger-stacks';
import type { DMKTransport } from '@zondax/ledger-stacks';

import type { LedgerDeviceActionOptions } from '../dmk/ledger-device-action';

export type RunSignerAction = <Output, Error, Intermediate extends DeviceActionIntermediateValue>(
  action: ExecuteDeviceActionReturnType<Output, Error, Intermediate>,
  options?: LedgerDeviceActionOptions<Intermediate>
) => Promise<Output>;

export interface LedgerBitcoinApp {
  chain: 'bitcoin';
  signer: SignerBtc;
  sessionId: DeviceSessionId;
  runAction: RunSignerAction;
}

export interface LedgerStacksApp {
  chain: 'stacks';
  app: StacksApp<DMKTransport>;
  sessionId: DeviceSessionId;
}

export type LedgerApp = LedgerBitcoinApp | LedgerStacksApp;
