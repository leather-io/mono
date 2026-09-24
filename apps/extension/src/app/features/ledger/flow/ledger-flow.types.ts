import type { SupportedBlockchains } from '@leather.io/models';

import type { BitcoinInputSigningConfig } from '@shared/crypto/bitcoin/signer-config';
import type { UnsignedMessage } from '@shared/signature/signature-types';

export type VerifyAddressVariant = 'btcNativeSegwit' | 'btcTaproot' | 'btcMultisig' | 'stx';

export interface SignBitcoinTxLedgerFlowRequest {
  kind: 'sign-bitcoin-tx';
  psbt: Uint8Array;
  inputsToSign: BitcoinInputSigningConfig[];
  descriptor?: string;
  settleOnRejection: boolean;
}

export interface SignStacksTxLedgerFlowRequest {
  kind: 'sign-stacks-tx';
  tx: string;
  settleOnRejection: boolean;
}

export interface SignStacksMessageLedgerFlowRequest {
  kind: 'sign-stacks-message';
  message: UnsignedMessage;
}

interface RequestKeysLedgerFlowRequest {
  kind: 'request-keys';
  chain: SupportedBlockchains;
  autoConnect: boolean;
}

interface VerifyAddressLedgerFlowRequest {
  kind: 'verify-address';
  variant: VerifyAddressVariant;
}

export interface ConfirmBtcPolicyAddressLedgerFlowRequest {
  kind: 'confirm-btc-policy-address';
  descriptor: string;
  address: string | null;
  onConfirmed(): Promise<void>;
}

interface ConnectStartLedgerFlowRequest {
  kind: 'connect-start';
}

interface UnsupportedBrowserLedgerFlowRequest {
  kind: 'unsupported-browser';
}

export type LedgerFlowHandoffRequest =
  | RequestKeysLedgerFlowRequest
  | VerifyAddressLedgerFlowRequest
  | ConnectStartLedgerFlowRequest
  | UnsupportedBrowserLedgerFlowRequest;

export type LedgerFlowRequest =
  | SignBitcoinTxLedgerFlowRequest
  | SignStacksTxLedgerFlowRequest
  | SignStacksMessageLedgerFlowRequest
  | ConfirmBtcPolicyAddressLedgerFlowRequest
  | LedgerFlowHandoffRequest;

export type ActiveLedgerFlowRequest = LedgerFlowRequest & { id: number };

export interface LedgerStacksAppVersionInfo {
  currentVersion: string;
  requiredVersion: string;
}

export type LedgerStep =
  | { name: 'connect'; retryImmediately: boolean }
  | { name: 'checking-app-version' }
  | { name: 'device-busy'; description?: string; address?: string }
  | { name: 'connection-error'; chain: SupportedBlockchains; errorMessage?: string }
  | { name: 'connection-success'; chain: SupportedBlockchains }
  | { name: 'awaiting-device-operation'; hasApprovedOperation: boolean }
  | { name: 'public-key-mismatch' }
  | { name: 'payload-invalid' }
  | { name: 'operation-rejected'; description?: string }
  | { name: 'disconnected' }
  | { name: 'broadcast-error'; error: string }
  | { name: 'outdated-stacks-app'; versionInfo?: LedgerStacksAppVersionInfo }
  | { name: 'choose-address-standard'; connectImmediatelyAfter: boolean };

export type LedgerStepName = LedgerStep['name'];
