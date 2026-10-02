import type * as btc from '@scure/btc-signer';
import type { StacksTransactionWire } from '@stacks/transactions';

import type { SupportedBlockchains } from '@leather.io/models';

import type { BitcoinInputSigningConfig } from '@shared/crypto/bitcoin/signer-config';
import type { SignatureData, UnsignedMessage } from '@shared/signature/signature-types';

export type VerifyAddressVariant = 'btcNativeSegwit' | 'btcTaproot' | 'btcMultisig' | 'stx';

interface SignBitcoinTxLedgerFlowRequest {
  kind: 'sign-bitcoin-tx';
  psbt: Uint8Array;
  inputsToSign: BitcoinInputSigningConfig[];
  descriptor?: string;
  settleOnRejection: boolean;
}

interface SignStacksTxLedgerFlowRequest {
  kind: 'sign-stacks-tx';
  tx: string;
  settleOnRejection: boolean;
}

interface SignStacksMessageLedgerFlowRequest {
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

interface LedgerSigningRequests {
  'sign-bitcoin-tx': SignBitcoinTxLedgerFlowRequest;
  'sign-stacks-tx': SignStacksTxLedgerFlowRequest;
  'sign-stacks-message': SignStacksMessageLedgerFlowRequest;
}

export interface LedgerSigningResults {
  'sign-bitcoin-tx': btc.Transaction;
  'sign-stacks-tx': StacksTransactionWire;
  'sign-stacks-message': SignatureData;
}

export type LedgerSigningKind = keyof LedgerSigningResults;

export type LedgerSigningRequest<K extends LedgerSigningKind> = LedgerSigningRequests[K] & {
  kind: K;
};

export type LedgerSigningFailure =
  | { status: 'cancelled' }
  | { status: 'dismissed' }
  | { status: 'failed'; error: string };

export type LedgerSigningOutcome<T> = { status: 'signed'; value: T } | LedgerSigningFailure;

export interface LedgerSigningTarget<T> {
  id: number;
  resolve(outcome: LedgerSigningOutcome<T>): void;
}

type ActiveLedgerSigningRequests = {
  [K in LedgerSigningKind]: LedgerSigningRequests[K] & LedgerSigningTarget<LedgerSigningResults[K]>;
};

export type ActiveLedgerSigningRequest<K extends LedgerSigningKind = LedgerSigningKind> =
  ActiveLedgerSigningRequests[K];

export type LedgerNonSigningFlowRequest =
  | ConfirmBtcPolicyAddressLedgerFlowRequest
  | LedgerFlowHandoffRequest;

export type LedgerFlowRequest =
  | LedgerSigningRequests[LedgerSigningKind]
  | LedgerNonSigningFlowRequest;

export type ActiveLedgerFlowRequest =
  | ActiveLedgerSigningRequest
  | (LedgerNonSigningFlowRequest & { id: number });

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
  | { name: 'payload-invalid' }
  | { name: 'operation-rejected'; description?: string }
  | { name: 'disconnected' }
  | { name: 'outdated-stacks-app'; versionInfo?: LedgerStacksAppVersionInfo }
  | { name: 'choose-address-standard'; connectImmediatelyAfter: boolean };

export type LedgerStepName = LedgerStep['name'];
