import { bytesToHex } from '@stacks/common';
import { z } from 'zod';

import { ecdsaPublicKeyToSchnorr, encodeExtendedPublicKeyForNetwork } from '@leather.io/bitcoin';
import { keyOriginToDerivationPath } from '@leather.io/crypto';
import {
  type BtcAddress,
  type StxAddress,
  createRequestEncoder,
  createRpcSuccessResponse,
  getAddresses,
  stxGetAddresses,
} from '@leather.io/rpc';

import { logger } from '@shared/logger';
import { analytics } from '@shared/utils/analytics';

import { focusTabAndWindow } from '@app/common/focus-tab';
import { useRpcRequestParams } from '@app/common/hooks/use-rpc-request-params';
import { initialSearchParams } from '@app/common/initial-search-params';
import {
  useCurrentAccountNativeSegwitPayer,
  useCurrentNativeSegwitAccount,
} from '@app/store/accounts/blockchain/bitcoin/native-segwit-account.hooks';
import {
  useCurrentAccountTaprootPayer,
  useCurrentTaprootAccount,
} from '@app/store/accounts/blockchain/bitcoin/taproot-account.hooks';
import { useCurrentStacksAccount } from '@app/store/accounts/blockchain/stacks/stacks-account.hooks';
import { useAppPermissions } from '@app/store/app-permissions/app-permissions.hooks';
import { useCurrentNetwork } from '@app/store/networks/networks.selectors';

// We reuse this flow for both of these requests, so here we make a union of two
// possible requests
const getAddressesRequests = z.union([getAddresses.request, stxGetAddresses.request]);
const { decode } = createRequestEncoder(getAddressesRequests);

function useGetAddressesParams() {
  const { tabId, origin } = useRpcRequestParams();
  const request = initialSearchParams.get('rpcRequest');
  if (!request) throw new Error('Missing rpcRequest');
  return { tabId, origin, request: decode(request) };
}

function useGetDescriptors() {
  const nativeSegwitAccount = useCurrentNativeSegwitAccount();
  const taprootAccount = useCurrentTaprootAccount();
  const network = useCurrentNetwork();
  const bitcoinNetworkMode = network.chain.bitcoin.mode;
  const wpkhXpub = nativeSegwitAccount?.xpub;
  const trXpub = taprootAccount?.xpub;
  return {
    nativeSegwitDescriptor: wpkhXpub
      ? `wpkh(${encodeExtendedPublicKeyForNetwork(wpkhXpub, bitcoinNetworkMode)})`
      : null,
    taprootDescriptor: trXpub
      ? `tr(${encodeExtendedPublicKeyForNetwork(trXpub, bitcoinNetworkMode)})`
      : null,
  };
}

export function useGetAddresses() {
  const permissions = useAppPermissions();
  const { tabId, origin, request } = useGetAddressesParams();
  const createNativeSegwitPayer = useCurrentAccountNativeSegwitPayer();
  const createTaprootPayer = useCurrentAccountTaprootPayer();
  const stacksAccount = useCurrentStacksAccount();
  const { nativeSegwitDescriptor, taprootDescriptor } = useGetDescriptors();

  function focusInitiatingTab() {
    analytics.track('user_clicked_requested_by_link', { endpoint: request.method });
    focusTabAndWindow(tabId);
  }

  return {
    origin,
    focusInitiatingTab,
    onUserApproveGetAddresses() {
      if (!tabId || !origin) {
        logger.error('Cannot give app accounts: missing tabId, origin');
        return;
      }

      analytics.track('user_approved_get_addresses', { origin });

      permissions.hasRequestedAccounts(origin);

      const keysToIncludeInResponse = [];

      if (createNativeSegwitPayer) {
        const nativeSegwitSigner = createNativeSegwitPayer({
          changeIndex: 0,
          addressIndex: 0,
        });

        const nativeSegwitAddressResponse: BtcAddress = {
          symbol: 'BTC',
          type: 'p2wpkh',
          address: nativeSegwitSigner.address,
          publicKey: bytesToHex(nativeSegwitSigner.publicKey),
          derivationPath: keyOriginToDerivationPath(nativeSegwitSigner.keyOrigin),
          descriptor: nativeSegwitDescriptor ?? '',
        };

        keysToIncludeInResponse.push(nativeSegwitAddressResponse);
      }

      if (createTaprootPayer) {
        const taprootPayer = createTaprootPayer({ changeIndex: 0, addressIndex: 0 });
        const taprootAddressResponse: BtcAddress = {
          symbol: 'BTC',
          type: 'p2tr',
          address: taprootPayer.address,
          publicKey: bytesToHex(taprootPayer.publicKey),
          tweakedPublicKey: bytesToHex(ecdsaPublicKeyToSchnorr(taprootPayer.publicKey)),
          derivationPath: keyOriginToDerivationPath(taprootPayer.keyOrigin),
          descriptor: taprootDescriptor ?? '',
        };
        keysToIncludeInResponse.push(taprootAddressResponse);
      }

      if (stacksAccount) {
        const stacksAddressResponse = {
          symbol: 'STX',
          address: stacksAccount.address,
          publicKey: stacksAccount.stxPublicKey,
        } satisfies StxAddress;

        keysToIncludeInResponse.push(stacksAddressResponse);
      }

      void chrome.tabs.sendMessage(
        tabId,
        createRpcSuccessResponse(request.method, {
          id: request.id,
          result: { addresses: keysToIncludeInResponse },
        })
      );
    },
  };
}
