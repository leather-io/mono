import { customNetworkConfig } from '~/constants/custom-network-config';
import { leather } from '~/utils/leather-sdk';
import { isLeatherInstalled } from '~/utils/utils';

import { extractXpubFromDescriptor, getP2wpkhAddressFromPublicKey } from '@leather.io/bitcoin';
import { extractAccountPathFromFullPath } from '@leather.io/crypto';
import type { AuthNetworkId } from '@leather.io/models';
import type { WalletSignInPayload } from '@leather.io/services';

import { resolveBtcNetworkMode } from '../network/resolve-btc-network-mode';
import { resolveWalletRpcNetwork } from '../network/resolve-wallet-rpc-network';

interface WalletSignInParams {
  network: AuthNetworkId;
  message: string;
  timestamp: number;
}

type GetAddressesParams = NonNullable<Parameters<typeof leather.getAddresses>[0]>;

function getRpcRejectionMessage(error: unknown) {
  if (
    typeof error === 'object' &&
    error !== null &&
    'error' in error &&
    typeof error.error === 'object' &&
    error.error !== null &&
    'message' in error.error &&
    typeof error.error.message === 'string'
  )
    return error.error.message;
  return null;
}

async function fetchWalletAddresses(network: string, chains: GetAddressesParams['chains']) {
  try {
    const result = await leather.getAddresses({ network, chains });
    return result.addresses;
  } catch (error) {
    throw new Error(
      getRpcRejectionMessage(error) ?? 'Leather rejected the connection request. Please try again.'
    );
  }
}

type SignInNetworkMode = 'mainnet' | 'testnet' | 'regtest';

function networkModeOfAddress(address: string): SignInNetworkMode {
  if (address.startsWith('bc1')) return 'mainnet';
  if (address.startsWith('bcrt1')) return 'regtest';
  if (address.startsWith('tb1')) return 'testnet';
  if (address.startsWith('SP') || address.startsWith('SM')) return 'mainnet';
  return 'testnet';
}

function networkModeOfAuthNetwork(network: AuthNetworkId): SignInNetworkMode {
  if (network.endsWith('mainnet')) return 'mainnet';
  if (network.endsWith('regtest')) return 'regtest';
  return 'testnet';
}

// The wallet returns addresses for its own active network, independent of the web
// app's. If they disagree, the sign-in would send a mismatched address and the
// backend would reject it, so fail early with an actionable message instead.
function assertWalletMatchesNetwork(address: string, network: AuthNetworkId) {
  const requested = networkModeOfAuthNetwork(network);
  const walletMode = networkModeOfAddress(address);
  if (walletMode !== requested) {
    throw new Error(
      `Your Leather wallet is on ${walletMode}, but this is a ${requested} vault. Switch the extension to ${requested} and try again.`
    );
  }
}

async function btcSignIn(params: WalletSignInParams): Promise<WalletSignInPayload> {
  const rpcNetwork = resolveWalletRpcNetwork(params.network);
  const addresses = await fetchWalletAddresses(rpcNetwork, ['bitcoin']);
  const account = addresses.find(address => address.symbol === 'BTC' && address.type === 'p2wpkh');
  if (!account) {
    throw new Error('No Bitcoin account available in the connected wallet');
  }
  assertWalletMatchesNetwork(account.address, params.network);

  const signed = await leather.signMessage({
    message: params.message,
    paymentType: 'p2wpkh',
    network: rpcNetwork,
  });

  if (signed.address !== account.address) {
    throw new Error('Active wallet account changed during sign-in. Please try again.');
  }

  // Match the backend: derive the auth address from the pubkey in the resolved mode.
  const address = customNetworkConfig
    ? getP2wpkhAddressFromPublicKey(account.publicKey, resolveBtcNetworkMode(params.network))
    : account.address;

  return {
    signature: signed.signature,
    publicKey: account.publicKey,
    xpub: extractXpubFromDescriptor(account.descriptor),
    xpubOriginFingerprint: 'd34db33f', // temp mock
    xpubOriginPath: extractAccountPathFromFullPath(account.derivationPath),
    address,
    message: params.message,
    timestamp: params.timestamp,
  };
}

async function stxSignIn(params: WalletSignInParams): Promise<WalletSignInPayload> {
  const rpcNetwork = resolveWalletRpcNetwork(params.network);
  const addresses = await fetchWalletAddresses(rpcNetwork, ['stacks']);
  const account = addresses.find(address => address.symbol === 'STX');
  if (!account) {
    throw new Error('No Stacks account available in the connected wallet');
  }
  assertWalletMatchesNetwork(account.address, params.network);

  const signed = await leather.stxSignMessage({ message: params.message, network: rpcNetwork });

  if (signed.publicKey !== account.publicKey) {
    throw new Error('Active wallet account changed during sign-in. Please try again.');
  }

  return {
    signature: signed.signature,
    publicKey: signed.publicKey,
    address: account.address,
    message: params.message,
    timestamp: params.timestamp,
  };
}

export async function walletSignIn(params: WalletSignInParams): Promise<WalletSignInPayload> {
  if (!isLeatherInstalled()) {
    throw new Error('Leather wallet not detected. Install the Leather extension to connect.');
  }

  if (params.network.startsWith('btc')) return btcSignIn(params);
  return stxSignIn(params);
}
