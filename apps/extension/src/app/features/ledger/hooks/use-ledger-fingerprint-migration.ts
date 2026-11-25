import { useCallback } from 'react';

import type { HardwareWallet, OperationContext } from '@leather.io/ledger';

import { logger } from '@shared/logger';
import { assumedZeroFingerprint } from '@shared/utils';

import { useAppDispatch } from '@app/store';
import { useCurrentAccountId } from '@app/store/accounts/account';
import { migrateLedgerStacksFingerprint } from '@app/store/wallets/wallet.actions';
import { useWalletEntities } from '@app/store/wallets/wallet.selectors';

export function useLedgerFingerprintMigration() {
  const dispatch = useAppDispatch();
  const wallets = useWalletEntities();
  const currentAccount = useCurrentAccountId();

  return useCallback(
    async (wallet: HardwareWallet, ctx: OperationContext): Promise<void> => {
      const currentWallet = wallets[currentAccount.fingerprint];

      function isMigrationNeeded() {
        return (
          currentWallet?.type === 'ledger' && currentAccount.fingerprint === assumedZeroFingerprint
        );
      }

      if (!isMigrationNeeded()) return;

      logger.info('Ledger fingerprint migration required, requesting fingerprint from device');

      try {
        const actualFingerprint = await wallet.getMasterFingerprint(ctx);

        void dispatch(migrateLedgerStacksFingerprint({ fingerprint: actualFingerprint }));

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
