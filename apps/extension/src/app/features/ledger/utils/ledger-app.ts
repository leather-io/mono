import type { DeviceSessionId } from '@ledgerhq/device-management-kit';
import type { SignerBtc } from '@ledgerhq/device-signer-kit-bitcoin';
import type StacksApp from '@zondax/ledger-stacks';
import type { DMKTransport } from '@zondax/ledger-stacks';

import type { RunLedgerDeviceAction } from '../dmk/ledger-device-action';

export interface LedgerBitcoinApp {
  chain: 'bitcoin';
  signer: SignerBtc;
  sessionId: DeviceSessionId;
  runAction: RunLedgerDeviceAction;
}

export interface LedgerStacksApp {
  chain: 'stacks';
  app: StacksApp<DMKTransport>;
  sessionId: DeviceSessionId;
}

export type LedgerApp = LedgerBitcoinApp | LedgerStacksApp;
