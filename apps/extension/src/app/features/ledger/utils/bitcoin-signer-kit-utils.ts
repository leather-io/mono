import { useMemo, useRef } from 'react';

import {
  type DeviceActionIntermediateValue,
  type DeviceManagementKit,
  type DeviceSessionId,
  type ExecuteDeviceActionReturnType,
} from '@ledgerhq/device-management-kit';
import {
  type DefaultWallet,
  type GetWalletAddressDAIntermediateValue,
  type RegisterWalletDAIntermediateValue,
  type RegisteredWallet,
  type SignPsbtDAIntermediateValue,
  type SignPsbtDAOutput,
  SignerBtcBuilder,
  type WalletPolicy,
} from '@ledgerhq/device-signer-kit-bitcoin';
import { bytesToHex } from '@noble/hashes/utils';

import {
  type LedgerDeviceActionHandle,
  type LedgerDeviceActionOptions,
  type RunLedgerDeviceAction,
  runLedgerDeviceAction,
  runLedgerDeviceActionToCompletion,
} from '../dmk/ledger-device-action';
import type { LedgerBitcoinApp } from './ledger-app';

const skipOpenApp = true;
const changeChainIndex = 1;
const masterKeyPathPrefix = 'm/';

export const registerLedgerWalletPolicyPrompt = 'Approve the Leather wallet policy on your Ledger…';

type LedgerWallet = DefaultWallet | RegisteredWallet;

type PsbtSignature = SignPsbtDAOutput[number];

export type PartialSignature = Extract<
  PsbtSignature,
  { pubkey: Uint8Array; signature: Uint8Array }
>;

function isPartialSignature(signature: PsbtSignature): signature is PartialSignature {
  return 'pubkey' in signature && 'signature' in signature;
}

export function useSignerActionController() {
  const activeHandle = useRef<LedgerDeviceActionHandle<unknown> | null>(null);

  return useMemo(() => {
    async function run<Output, Error, Intermediate extends DeviceActionIntermediateValue>(
      action: ExecuteDeviceActionReturnType<Output, Error, Intermediate>,
      options?: LedgerDeviceActionOptions<Intermediate>
    ): Promise<Output> {
      const handle = runLedgerDeviceAction(action, options);
      activeHandle.current = handle;
      try {
        return await handle.result;
      } finally {
        if (activeHandle.current === handle) activeHandle.current = null;
      }
    }

    return {
      run,
      cancelActive() {
        activeHandle.current?.cancel();
        activeHandle.current = null;
      },
    };
  }, []);
}

export function createLedgerBitcoinApp(
  dmk: DeviceManagementKit,
  sessionId: DeviceSessionId,
  runAction: RunLedgerDeviceAction = runLedgerDeviceActionToCompletion
): LedgerBitcoinApp {
  return {
    chain: 'bitcoin',
    signer: new SignerBtcBuilder({ dmk, sessionId }).build(),
    sessionId,
    runAction,
  };
}

export function toSignerKitDerivationPath(path: string) {
  return path.startsWith(masterKeyPathPrefix) ? path.slice(masterKeyPathPrefix.length) : path;
}

export async function getMasterFingerprintHex(app: LedgerBitcoinApp): Promise<string> {
  const { masterFingerprint } = await app.runAction(
    app.signer.getMasterFingerprint({ skipOpenApp })
  );
  return bytesToHex(masterFingerprint);
}

export async function getExtendedPublicKey(
  app: LedgerBitcoinApp,
  derivationPath: string
): Promise<string> {
  const { extendedPublicKey } = await app.runAction(
    app.signer.getExtendedPublicKey(toSignerKitDerivationPath(derivationPath), { skipOpenApp })
  );
  return extendedPublicKey;
}

export function registerWalletPolicy(
  app: LedgerBitcoinApp,
  policy: WalletPolicy,
  options?: LedgerDeviceActionOptions<RegisterWalletDAIntermediateValue>
): Promise<RegisteredWallet> {
  return app.runAction(app.signer.registerWallet(policy, { skipOpenApp }), options);
}

export async function signPsbtWithWallet(
  app: LedgerBitcoinApp,
  wallet: LedgerWallet,
  psbtBase64: string,
  options?: LedgerDeviceActionOptions<SignPsbtDAIntermediateValue>
): Promise<PartialSignature[]> {
  const signatures = await app.runAction(
    app.signer.signPsbt(wallet, psbtBase64, { skipOpenApp }),
    options
  );
  return signatures.filter(isPartialSignature);
}

interface WalletAddressIndexes {
  changeIndex: number;
  addressIndex: number;
}

export async function getWalletAddressOnDevice(
  app: LedgerBitcoinApp,
  wallet: LedgerWallet,
  { changeIndex, addressIndex }: WalletAddressIndexes,
  options?: LedgerDeviceActionOptions<GetWalletAddressDAIntermediateValue>
): Promise<string> {
  const { address } = await app.runAction(
    app.signer.getWalletAddress(wallet, addressIndex, {
      checkOnDevice: true,
      change: changeIndex === changeChainIndex,
      skipOpenApp,
    }),
    options
  );
  return address;
}
