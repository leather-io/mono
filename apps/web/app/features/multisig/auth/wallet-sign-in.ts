import { getDefaultStore } from 'jotai';
import { addressesAtom } from '~/store/addresses';
import { leather } from '~/utils/leather-sdk';
import { isLeatherInstalled } from '~/utils/utils';

import type { ChainNetworkId } from '@leather.io/models';
import type { WalletSignInPayload } from '@leather.io/services';

interface WalletSignInParams {
  network: ChainNetworkId;
  message: string;
  timestamp: number;
}

async function getWalletAddresses() {
  const store = getDefaultStore();
  const known = store.get(addressesAtom);
  if (known.length > 0) return known;

  const result = await leather.getAddresses();
  store.set(addressesAtom, result.addresses);
  return result.addresses;
}

async function btcSignIn(params: WalletSignInParams): Promise<WalletSignInPayload> {
  const addresses = await getWalletAddresses();
  const account = addresses.find(
    address => address.symbol === 'BTC' && address.type === 'p2wpkh'
  );
  if (!account) {
    throw new Error('No Bitcoin account available in the connected wallet');
  }

  const signed = await leather.signMessage({
    message: params.message,
    paymentType: 'p2wpkh',
  });

  return {
    signature: signed.signature,
    publicKey: account.publicKey,
    address: signed.address,
    message: params.message,
    timestamp: params.timestamp,
  };
}

async function stxSignIn(params: WalletSignInParams): Promise<WalletSignInPayload> {
  const addresses = await getWalletAddresses();
  const account = addresses.find(address => address.symbol === 'STX');
  if (!account) {
    throw new Error('No Stacks account available in the connected wallet');
  }

  const signed = await leather.stxSignMessage({ message: params.message });

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
