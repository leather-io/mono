import {
  MethodParams,
  StacksProvider,
  disconnect,
  getSelectedProvider,
  getSelectedProviderId,
  request,
  setSelectedProviderId,
} from '@stacks/connect';
import { ContractIdString } from '@stacks/transactions';
import { getLeatherMockMode } from '~/constants/environment';
import { StxCallContractParams, leather } from '~/utils/leather-sdk';
import { WalletAddressEntry, normalizeWalletAddresses } from '~/utils/wallet-addresses';

import { delay } from '@leather.io/utils';

export const leatherProviderId = 'LeatherProvider';

const connectRequestOptions = { enableLocalStorage: false };

type WalletAddressPurpose = 'payment' | 'ordinals' | 'stacks';

interface ConnectAddressesParams extends MethodParams<'getAddresses'> {
  addresses: WalletAddressPurpose[];
}

const connectAddressesParams: ConnectAddressesParams = {
  addresses: ['payment', 'ordinals', 'stacks'],
};

interface RawWalletProvider {
  request(method: string): Promise<unknown>;
}

const revokePermissionsTimeoutMs = 2000;

export async function revokeWalletPermissions(): Promise<boolean> {
  const providerId = getSelectedProviderId();
  if (!providerId || providerId === leatherProviderId) return false;
  const provider: RawWalletProvider | undefined = getSelectedProvider();
  if (!provider) return false;
  try {
    await Promise.race([provider.request('wallet_disconnect'), delay(revokePermissionsTimeoutMs)]);
  } catch {
    return true;
  }
  return true;
}

type ConnectWalletResult =
  | { status: 'connected'; addresses: WalletAddressEntry[] }
  | { status: 'canceled'; sessionRevoked: boolean };

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

export async function connectWallet(): Promise<ConnectWalletResult> {
  if (getLeatherMockMode()) {
    const result = await leather.getAddresses();
    return { status: 'connected', addresses: normalizeWalletAddresses(result.addresses) };
  }
  const sessionRevoked = await revokeWalletPermissions();
  try {
    const result = await request(
      { ...connectRequestOptions, forceWalletSelect: true },
      'getAddresses',
      connectAddressesParams
    );
    return { status: 'connected', addresses: normalizeWalletAddresses(result.addresses) };
  } catch {
    if (sessionRevoked) disconnect();
    return { status: 'canceled', sessionRevoked };
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

function isContractIdString(value: string): value is ContractIdString {
  return value.includes('.');
}

export async function walletStxCallContract(
  params: StxCallContractParams
): Promise<WalletTransactionResult> {
  if (getLeatherMockMode()) return leather.stxCallContract(params);
  const { contract } = params;
  if (!isContractIdString(contract)) {
    throw new Error(`Invalid contract identifier: ${contract}`);
  }
  const provider: StacksProvider | undefined = getSelectedProvider();
  if (!provider) throw new WalletProviderUnavailableError();
  return request({ ...connectRequestOptions, provider }, 'stx_callContract', {
    ...params,
    contract,
  });
}

export const wallet = { stxCallContract: walletStxCallContract };
