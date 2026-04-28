import { useCallback } from 'react';
import { useSelector } from 'react-redux';

import { makeAuthResponse } from '@stacks/wallet-sdk';

import { gaiaUrl } from '@leather.io/constants';

import { finalizeAuthResponse } from '@shared/actions/finalize-auth-response';
import { logger } from '@shared/logger';

import { useAuthRequestParams } from '@app/common/hooks/auth/use-auth-request-params';
import { useOnboardingState } from '@app/common/hooks/auth/use-onboarding-state';
import { useKeyActions } from '@app/common/hooks/use-key-actions';
import { useWalletType } from '@app/common/use-wallet-type';
import type { RootState } from '@app/store';
import { selectStacksAccountState } from '@app/store/accounts/blockchain/stacks/stacks-account.selectors';
import { useActiveWalletSecretKey } from '@app/store/in-memory-key/in-memory-key.selectors';
import { useInMemoryKeys } from '@app/store/in-memory-key/use-in-memory-keys';
import { selectCurrentAccount } from '@app/store/software-keys/software-key.selectors';

import { useGetLegacyAuthBitcoinAddresses } from './use-legacy-auth-bitcoin-addresses';

export function useFinishAuthRequest() {
  const { decodedAuthRequest, authRequest } = useOnboardingState();
  const keyActions = useKeyActions();
  const { walletType } = useWalletType();
  const currentAccount = useSelector(selectCurrentAccount);

  const { origin, tabId } = useAuthRequestParams();
  const hasSecretKey = !!useActiveWalletSecretKey();
  const { version } = useInMemoryKeys();
  const stacksAccounts = useSelector((state: RootState) =>
    selectStacksAccountState(state, version)
  );

  // TODO: It would be good to separate out finishing auth by the wallet vs an app
  // so that the additional data we provide apps can be removed from our onboarding.
  // Currently, these create errors unless early returns are used in the keychain code.
  const getLegacyAuthBitcoinData = useGetLegacyAuthBitcoinAddresses();

  return useCallback(
    async (accountIndex: number) => {
      const account = stacksAccounts.find(
        a => a.fingerprint === currentAccount.fingerprint && a.index === accountIndex
      );

      if (!decodedAuthRequest || !authRequest || !account || !origin || !tabId) {
        logger.error('Uh oh! Finished onboarding without auth info.');
        return;
      }

      const appURL = new URL(origin);

      // We can't perform any of this logic for non-software wallets
      // as they require the key to be available in the JS context
      if (walletType === 'software' && account.type === 'software') {
        // NOTE: not sure if this is needed but it replicates a behavior of a deprecated useLegacyStacksWallet hook
        if (!hasSecretKey) return;

        try {
          const authResponse = await makeAuthResponse({
            gaiaHubUrl: gaiaUrl,
            appDomain: appURL.origin,
            transitPublicKey: decodedAuthRequest.public_keys[0],
            scopes: decodedAuthRequest.scopes,
            account: account,
            additionalData: {
              ...getLegacyAuthBitcoinData(accountIndex),
              walletProvider: 'leather',
            },
          });

          keyActions.switchAccount({ fingerprint: currentAccount.fingerprint, accountIndex });

          finalizeAuthResponse({
            decodedAuthRequest,
            authRequest,
            authResponse,
            requestingOrigin: origin,
            tabId,
          });
        } catch (e) {
          logger.error('Error finishing auth request', e);
        }
      }
    },
    [
      decodedAuthRequest,
      authRequest,
      origin,
      tabId,
      walletType,
      hasSecretKey,
      stacksAccounts,
      getLegacyAuthBitcoinData,
      keyActions,
      currentAccount.fingerprint,
    ]
  );
}
