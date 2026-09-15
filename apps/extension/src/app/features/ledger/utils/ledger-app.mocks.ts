import {
  DeviceActionStatus,
  type ExecuteDeviceActionReturnType,
} from '@ledgerhq/device-management-kit';
import type { SignerBtc } from '@ledgerhq/device-signer-kit-bitcoin';
import type StacksApp from '@zondax/ledger-stacks';
import type { DMKTransport } from '@zondax/ledger-stacks';
import { of } from 'rxjs';
import { vi } from 'vitest';

import { runLedgerDeviceAction } from '../dmk/ledger-device-action';
import type { LedgerBitcoinApp, LedgerStacksApp } from './ledger-app';

export const fakeLedgerSessionId = 'session-1';

export function fakeSignerAction<Output>(
  output: Output
): ExecuteDeviceActionReturnType<Output, never, never> {
  return { observable: of({ status: DeviceActionStatus.Completed, output }), cancel: vi.fn() };
}

export function makeFakeLedgerBitcoinApp(signer: Partial<SignerBtc> = {}): LedgerBitcoinApp {
  return {
    chain: 'bitcoin',
    signer: {
      getExtendedPublicKey: vi.fn(),
      getMasterFingerprint: vi.fn(),
      registerWallet: vi.fn(),
      signMessage: vi.fn(),
      signPsbt: vi.fn(),
      signTransaction: vi.fn(),
      getWalletAddress: vi.fn(),
      ...signer,
    },
    sessionId: fakeLedgerSessionId,
    runAction: (action, options) => runLedgerDeviceAction(action, options).result,
  };
}

export function makeFakeLedgerStacksApp(
  app: Partial<StacksApp<DMKTransport>> = {}
): LedgerStacksApp {
  const stacksApp: StacksApp<DMKTransport> = Object.create(null);
  return { chain: 'stacks', app: Object.assign(stacksApp, app), sessionId: fakeLedgerSessionId };
}
