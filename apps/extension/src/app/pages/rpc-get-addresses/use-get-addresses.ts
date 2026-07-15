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
import { sendMessageToOriginatingFrame } from '@shared/messaging/send-message-to-originating-frame';
import { analytics } from '@shared/utils/analytics';

import { focusTabAndWindow } from '@app/common/focus-tab';
import { useRpcRequestParams } from '@app/common/hooks/use-rpc-request-params';
import { initialSearchParams } from '@app/common/initial-search-params';
import { useFlags } from '@app/features/feature-flags';
import { persistor } from '@app/store';
import { useCurrentAccountId } from '@app/store/accounts/account';
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
import { useCurrentPolicy } from '@app/store/policy/policy.selectors';

// We reuse this flow for both of these requests, so here we make a union of two
// possible requests
const getAddressesRequests = z.union([getAddresses.request, stxGetAddresses.request]);
const { decode } = createRequestEncoder(getAddressesRequests);

function useGetAddressesParams() {
  const { frameId, tabId, origin } = useRpcRequestParams();
  const request = initialSearchParams.get('rpcRequest');
  if (!request) throw new Error('Missing rpcRequest');
  return { frameId, tabId, origin, request: decode(request) };
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
  const { frameId, tabId, origin, request } = useGetAddressesParams();
  const createNativeSegwitPayer = useCurrentAccountNativeSegwitPayer();
  const createTaprootPayer = useCurrentAccountTaprootPayer();
  const currentAccount = useCurrentAccountId();
  const stacksAccount = useCurrentStacksAccount();
  const { nativeSegwitDescriptor, taprootDescriptor } = useGetDescriptors();
  const { releaseAddAccount, enableAllowPolicyAccounts } = useFlags();
  const currentPolicy = useCurrentPolicy();
  const allowPolicyAccounts =
    releaseAddAccount &&
    (enableAllowPolicyAccounts ? Boolean(request.params?.allowPolicyAccounts) : true);

  function focusInitiatingTab() {
    analytics.track('user_clicked_requested_by_link', { endpoint: request.method });
    focusTabAndWindow(tabId);
  }

  return {
    origin,
    allowPolicyAccounts,
    focusInitiatingTab,
    async onUserApproveGetAddresses() {
      if (!tabId || !origin) {
        logger.error('Cannot give app accounts: missing tabId, origin');
        return;
      }

      analytics.track('user_approved_get_addresses', { origin });

      const connectedPolicy = allowPolicyAccounts && currentPolicy ? currentPolicy : null;

      permissions.hasRequestedAccounts(origin, connectedPolicy?.id);

      const keysToIncludeInResponse = [];

      if (connectedPolicy) {
        if (connectedPolicy.chain === 'bitcoin') {
          const policyAddressResponse: BtcAddress = {
            symbol: 'BTC',
            type: 'p2wsh',
            address: connectedPolicy.address,
            descriptor: connectedPolicy.descriptor,
          };
          keysToIncludeInResponse.push(policyAddressResponse);
        } else {
          const multisigStacksAddressResponse: StxAddress = {
            symbol: 'STX',
            kind: 'multisig',
            address: connectedPolicy.address,
            threshold: connectedPolicy.threshold,
            publicKeys: connectedPolicy.publicKeys,
          };
          keysToIncludeInResponse.push(multisigStacksAddressResponse);
        }
      } else {
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
            fingerprint: currentAccount.fingerprint,
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
            fingerprint: currentAccount.fingerprint,
          };
          keysToIncludeInResponse.push(taprootAddressResponse);
        }

        if (stacksAccount) {
          const stacksAddressResponse = {
            symbol: 'STX',
            kind: 'single-sig',
            address: stacksAccount.address,
            publicKey: stacksAccount.stxPublicKey,
          } satisfies StxAddress;

          keysToIncludeInResponse.push(stacksAddressResponse);
        }
      }

      await persistor.flush();

      void sendMessageToOriginatingFrame(
        { frameId, tabId },
        createRpcSuccessResponse(request.method, {
          id: request.id,
          result: { addresses: keysToIncludeInResponse },
        })
      );
    },
  };
}
