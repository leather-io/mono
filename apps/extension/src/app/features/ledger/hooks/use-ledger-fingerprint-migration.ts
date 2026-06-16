import { useCallback } from 'react';
import { useDispatch } from 'react-redux';

import { bytesToHex } from '@noble/hashes/utils';
import type StacksApp from '@zondax/ledger-stacks';

import { fingerprintMigration, userAddsWallet, userRemovesWallet } from '@leather.io/state/wallet';

import { logger } from '@shared/logger';
import { assumedZeroFingerprint } from '@shared/utils';

import { useCurrentAccountId } from '@app/store/accounts/account';
import { useWalletEntities } from '@app/store/wallets/wallet.selectors';

export function useLedgerFingerprintMigration() {
  const dispatch = useDispatch();
  const wallets = useWalletEntities();
  const currentAccount = useCurrentAccountId();

  return useCallback(
    async (stacksApp: StacksApp): Promise<void> => {
      const currentWallet = wallets[currentAccount.fingerprint];

      function isMigrationNeeded() {
        return (
          currentWallet?.type === 'ledger' && currentAccount.fingerprint === assumedZeroFingerprint
        );
      }

      if (!isMigrationNeeded()) return;

      logger.info('Ledger fingerprint migration required, requesting fingerprint from device');

      try {
        const fingerprintResp = await stacksApp.getMasterFingerprint();
        const actualFingerprint = bytesToHex(fingerprintResp.fingerprint);

        if (actualFingerprint === assumedZeroFingerprint) return;

        dispatch(fingerprintMigration(actualFingerprint));

        const oldWallet = wallets[assumedZeroFingerprint];
        if (oldWallet) {
          dispatch(userRemovesWallet({ fingerprint: assumedZeroFingerprint }));
          dispatch(
            userAddsWallet({
              wallet: { ...oldWallet, fingerprint: actualFingerprint },
              accountKeychains: [],
            })
          );
        }

        logger.info(
          `Successfully migrated Ledger fingerprint: ${assumedZeroFingerprint} → ${actualFingerprint}`
        );
      } catch (error) {
        logger.error('Failed to migrate Ledger fingerprint:', error);
      }
    },
    [wallets, currentAccount, dispatch]
  );
}
