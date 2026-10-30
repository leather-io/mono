import {
  JsonRpcErrorCode,
  type MethodParams,
  type StacksProvider,
  disconnect,
  getSelectedProvider,
  getSelectedProviderId,
  request,
  setSelectedProviderId,
} from '@stacks/connect';
import { z } from 'zod';
import { getLeatherMockMode } from '~/constants/environment';
import { type StxCallContractParams, leather } from '~/utils/leather-sdk';
import { type WalletAddressEntry, normalizeWalletAddresses } from '~/utils/wallet-addresses';

import { RpcErrorCode } from '@leather.io/rpc';
import { delay } from '@leather.io/utils';

const userRejectionErrorCode: number = JsonRpcErrorCode.UserRejection;

export const leatherProviderId = 'LeatherProvider';

const connectRequestOptions = { enableLocalStorage: false };

type WalletAddressPurpose = 'payment' | 'ordinals' | 'stacks';

interface ConnectAddressesParams extends MethodParams<'getAddresses'> {
  addresses: WalletAddressPurpose[];
}

const connectAddressesParams: ConnectAddressesParams = {
  addresses: ['payment', 'ordinals', 'stacks'],
};

const revokePermissionsTimeoutMs = 2000;

interface RawWalletProvider {
  request(method: string): Promise<unknown>;
}

function hasRequestFunction(value: unknown) {
  return (
    typeof value === 'object' &&
    value !== null &&
    'request' in value &&
    typeof value.request === 'function'
  );
}

const rawWalletProviderSchema = z.custom<RawWalletProvider>(hasRequestFunction);

const stacksProviderSchema = z.custom<StacksProvider>(hasRequestFunction);

const contractIdStringSchema = z.templateLiteral([z.string(), '.', z.string()]);

async function requestWalletDisconnect(provider: RawWalletProvider) {
  await provider.request('wallet_disconnect');
  return true;
}

async function waitForRevokePermissionsTimeout() {
  await delay(revokePermissionsTimeoutMs);
  return false;
}

export async function revokeWalletPermissions(): Promise<boolean> {
  const providerId = getSelectedProviderId();
  if (!providerId || providerId === leatherProviderId) return false;
  const parsedProvider = rawWalletProviderSchema.safeParse(getSelectedProvider());
  if (!parsedProvider.success) return false;
  const provider = parsedProvider.data;
  try {
    // Only a completed wallet_disconnect revokes the session. A timeout or a
    // throw leaves it intact, and callers clear stored addresses off this.
    return await Promise.race([
      requestWalletDisconnect(provider),
      waitForRevokePermissionsTimeout(),
    ]);
  } catch {
    return false;
  }
}

type ConnectWalletResult =
  | { status: 'connected'; addresses: WalletAddressEntry[] }
  | { status: 'canceled'; sessionRevoked: boolean }
  | { status: 'error'; error: unknown; sessionRevoked: boolean };

export interface WalletTransactionResult {
  txid?: string;
  transaction?: string;
}

export class WalletProviderUnavailableError extends Error {
  constructor() {
    super('No wallet provider is selected');
    this.name = 'WalletProviderUnavailableError';
  }
}

function getRpcErrorCode(error: unknown): number | null {
  if (!error || typeof error !== 'object') return null;
  if ('code' in error && typeof error.code === 'number') return error.code;
  if ('error' in error) {
    const inner = error.error;
    if (inner && typeof inner === 'object' && 'code' in inner && typeof inner.code === 'number') {
      return inner.code;
    }
  }
  return null;
}

const userRejectionErrorCodes: number[] = [
  RpcErrorCode.USER_REJECTION,
  JsonRpcErrorCode.UserCanceled,
];

export function isUserRejectionError(error: unknown): boolean {
  const code = getRpcErrorCode(error);
  if (code === null) return false;
  if (code === userRejectionErrorCode) {
    return getConnectedWalletId() !== leatherProviderId;
  }
  return userRejectionErrorCodes.includes(code);
}

interface ConnectWalletOptions {
  allowWalletSelect: boolean;
}

export async function connectWallet({
  allowWalletSelect,
}: ConnectWalletOptions): Promise<ConnectWalletResult> {
  if (getLeatherMockMode()) {
    const result = await leather.getAddresses();
    return { status: 'connected', addresses: normalizeWalletAddresses(result.addresses) };
  }
  const sessionRevoked = await revokeWalletPermissions();
  if (!allowWalletSelect) markLeatherAsSelectedWallet();
  try {
    const result = await request(
      { ...connectRequestOptions, forceWalletSelect: allowWalletSelect },
      'getAddresses',
      connectAddressesParams
    );
    return { status: 'connected', addresses: normalizeWalletAddresses(result.addresses) };
  } catch (error) {
    if (sessionRevoked) disconnect();
    if (isUserRejectionError(error)) return { status: 'canceled', sessionRevoked };
    return { status: 'error', error, sessionRevoked };
  }
}

export function disconnectWallet(): void {
  if (getLeatherMockMode()) return;
  void revokeWalletPermissions();
  disconnect();
}

export function getConnectedWalletId(): string | null {
  if (getLeatherMockMode()) return leatherProviderId;
  return getSelectedProviderId();
}

export function markLeatherAsSelectedWallet(): void {
  setSelectedProviderId(leatherProviderId);
}

export async function walletStxCallContract(
  params: StxCallContractParams
): Promise<WalletTransactionResult> {
  if (getLeatherMockMode()) return leather.stxCallContract(params);
  const parsedContract = contractIdStringSchema.safeParse(params.contract);
  if (!parsedContract.success) {
    throw new Error(`Invalid contract identifier: ${params.contract}`);
  }
  const contract = parsedContract.data;
  const parsedProvider = stacksProviderSchema.safeParse(getSelectedProvider());
  if (!parsedProvider.success) throw new WalletProviderUnavailableError();
  const provider = parsedProvider.data;
  return request({ ...connectRequestOptions, provider }, 'stx_callContract', {
    ...params,
    contract,
  });
}

export const wallet = { stxCallContract: walletStxCallContract };
