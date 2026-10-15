import type { DeviceManagementKit } from '@ledgerhq/device-management-kit';
import { ChainId } from '@stacks/network';
import {
  AddressVersion,
  PubKeyEncoding,
  createMessageSignature,
  createTransactionAuthField,
  deserializeTransaction,
  isSingleSig,
} from '@stacks/transactions';
import StacksApp, {
  DMKTransport,
  LedgerError,
  type ResponseAddress,
  type ResponseBase,
  type ResponseSign,
} from '@zondax/ledger-stacks';
import { compare } from 'compare-versions';
import { z } from 'zod';

import { whenStacksChainId } from '@leather.io/stacks';

import { isPopupMode } from '@app/common/utils';

import {
  type ConnectLedgerDeviceOptions,
  connectLedgerDeviceToApp,
} from '../dmk/ledger-device-connection';
import { makeLedgerAppResponseError } from '../dmk/ledger-dmk-errors';
import {
  LEDGER_APPS_MAP,
  type SemVerObject,
  prepareLedgerDeviceForAppFn,
  versionObjectToVersionString,
} from './generic-ledger-utils';
import type { LedgerStacksApp } from './ledger-app';

export function requestPublicKeyForStxAccount({ app }: LedgerStacksApp) {
  return async (derivationPath: string) =>
    app.getAddressAndPubKey(
      derivationPath,
      // We pass mainnet as it expects something, however this is so it can return a formatted address
      // We only need the public key, and can derive the address later in any network format
      AddressVersion.MainnetSingleSig
    );
}

export function showStxAddressOnDevice({ app }: LedgerStacksApp) {
  return async (derivationPath: string, version: AddressVersion): Promise<ResponseAddress> =>
    app.showAddressAndPubKey(derivationPath, version);
}

export function stacksChainIdToSingleSigAddressVersion(chainId: number): AddressVersion {
  return whenStacksChainId(chainId)({
    [ChainId.Mainnet]: AddressVersion.MainnetSingleSig,
    [ChainId.Testnet]: AddressVersion.TestnetSingleSig,
  });
}

export function hasLedgerReturnCode(response: ResponseBase, code: LedgerError) {
  const expectedReturnCode: number = code;
  return response.returnCode === expectedReturnCode;
}

export function isStxAddressResponseRejected(response: ResponseAddress) {
  return hasLedgerReturnCode(response, LedgerError.TransactionRejected);
}

export function isStxAddressResponseSuccess(response: ResponseAddress) {
  return hasLedgerReturnCode(response, LedgerError.NoErrors);
}

const ledgerSignResponseSchema = z.custom<ResponseSign>(
  response =>
    typeof response === 'object' &&
    response !== null &&
    'returnCode' in response &&
    'errorMessage' in response
);

function toLedgerSignResponse(response: unknown): ResponseSign {
  const parsedResponse = ledgerSignResponseSchema.safeParse(response);
  if (!parsedResponse.success) throw new Error('Unexpected Ledger Stacks sign response');
  return parsedResponse.data;
}

export interface StacksAppKeysResponseItem {
  path: string;
  stxPublicKey: string;
  dataPublicKey: string;
}

export async function connectLedgerStacksApp(
  dmk: DeviceManagementKit,
  options?: ConnectLedgerDeviceOptions
): Promise<LedgerStacksApp> {
  const sessionId = await connectLedgerDeviceToApp(dmk, LEDGER_APPS_MAP.STACKS, {
    canPromptForDevice: !isPopupMode(),
    ...options,
  });
  return { chain: 'stacks', app: new StacksApp(new DMKTransport(dmk, sessionId)), sessionId };
}

export interface StacksAppVersion extends Awaited<ReturnType<StacksApp['getVersion']>> {
  name: 'Stacks';
  chain: 'stacks';
}

export async function getStacksAppVersion({ app }: LedgerStacksApp): Promise<StacksAppVersion> {
  const appVersion = await app.getVersion();
  if (appVersion.errorMessage !== 'No errors') {
    throw makeLedgerAppResponseError(appVersion);
  }
  return { name: LEDGER_APPS_MAP.STACKS, chain: 'stacks' as const, ...appVersion };
}

export function prepareLedgerDeviceStacksAppConnection(
  dmk: DeviceManagementKit,
  options?: ConnectLedgerDeviceOptions
) {
  return prepareLedgerDeviceForAppFn(() => connectLedgerStacksApp(dmk, options));
}

export function signLedgerStacksTransaction({ app }: LedgerStacksApp) {
  return async (payload: Buffer, derivationPath: string): Promise<ResponseSign> =>
    toLedgerSignResponse(await app.sign(derivationPath, payload));
}

export function signLedgerStacksUtf8Message({ app }: LedgerStacksApp) {
  return async (payload: string, derivationPath: string): Promise<ResponseSign> =>
    toLedgerSignResponse(await app.sign_msg(derivationPath, payload));
}

export function signLedgerStacksStructuredMessage({ app }: LedgerStacksApp) {
  return async (domain: string, payload: string, derivationPath: string): Promise<ResponseSign> =>
    toLedgerSignResponse(await app.sign_structured_msg(derivationPath, domain, payload));
}

export function signStacksTransactionWithSignature(transaction: string, signatureVRS: Buffer) {
  const deserializedTx = deserializeTransaction(transaction);
  const signature = createMessageSignature(signatureVRS.toString('hex'));
  const spendingCondition = deserializedTx.auth.spendingCondition;

  if (isSingleSig(spendingCondition)) {
    spendingCondition.signature = signature;
    return deserializedTx;
  }

  spendingCondition.fields.push(createTransactionAuthField(PubKeyEncoding.Compressed, signature));
  return deserializedTx;
}

// Minimum version required to read master key fingerprint
// This enables proper multi-wallet support for Ledger Stacks accounts
export const MINIMUM_STACKS_APP_VERSION = '0.26.19';

interface StacksVersionCheckResult {
  meetsMinimum: boolean;
  currentVersion: string;
}
export function validateStacksAppVersion(version: SemVerObject): StacksVersionCheckResult {
  const currentVersion = versionObjectToVersionString(version);
  const meetsMinimum = compare(currentVersion, MINIMUM_STACKS_APP_VERSION, '>=');

  return { meetsMinimum, currentVersion };
}

export function isStacksAppOpen({ name }: { name: string }) {
  return name === LEDGER_APPS_MAP.STACKS;
}
