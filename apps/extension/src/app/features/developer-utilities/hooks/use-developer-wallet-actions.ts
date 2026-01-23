import { useMemo } from 'react';

import { logger } from '@sentry/react';
import { bytesToHex } from '@stacks/common';
import { decryptMnemonic as decrypt, encryptMnemonic as encrypt } from '@stacks/encryption';

import {
  deriveRootKeychainFromMnemonic,
  generateMnemonic,
  getMnemonicRootKeyFingerprint,
} from '@leather.io/crypto';
import { userAddsWallet, userRemovesWallet, userRenamesWallet } from '@leather.io/state/wallet';
import { toHexString } from '@leather.io/utils';

import { useAppDispatch } from '@app/store';
import { createNewAccount } from '@app/store/chains/stx-chain.actions';
import { inMemoryKeyActions } from '@app/store/in-memory-key/in-memory-key.actions';
import { getWalletSessionKey } from '@app/store/session-restore';
import { keySlice } from '@app/store/software-keys/software-key.slice';

export function useDeveloperWalletActions() {
  const dispatch = useAppDispatch();

  return useMemo(
    () => ({
      async addSoftwareWallet() {
        await chrome.storage.session.set({
          encryptionKey: process.env.DEBUG_DEV_WALLET_ENCRYPTION_KEY,
        });

        const mnemonic = generateMnemonic();
        logger.info('Generated mnemonic', { mnemonic });

        const keychain = await deriveRootKeychainFromMnemonic(mnemonic);
        logger.info('Derived keychain:', { keychain });

        const derivedKey = await getWalletSessionKey();
        logger.info('Derived key', { derivedKey });

        if (!derivedKey.success) {
          logger.error('Failed to get wallet session key');
          return;
        }

        logger.info('Derived key data:', { derivedKey: derivedKey.data });

        const encryptedMnemonic = await encrypt(mnemonic, derivedKey.data);
        logger.info('Encrypted mnemonic:', {
          encryptedMnemonic: bytesToHex(encryptedMnemonic),
        });

        const decrypted = await decrypt(encryptedMnemonic, derivedKey.data);
        logger.info('Decrypted mnemonic:', { decrypted });

        const fingerprint = getMnemonicRootKeyFingerprint(mnemonic);

        dispatch(
          userAddsWallet({
            wallet: {
              createdOn: new Date().toISOString(),
              fingerprint,
              type: 'software',
            },
            accountKeychains: [],
          })
        );

        dispatch(inMemoryKeyActions.setWalletKeys([{ fingerprint, secretKey: mnemonic }]));

        dispatch(
          keySlice.actions.addNewWallet({
            type: 'software',
            id: toHexString(keychain.fingerprint),
            encryptedSecretKey: bytesToHex(encryptedMnemonic),
          })
        );

        logger.info('Software wallet added successfully');
      },

      removeWallet(fingerprint: string) {
        dispatch(userRemovesWallet({ fingerprint }));
        dispatch(inMemoryKeyActions.lockWallet());
        logger.info('Wallet removed', { fingerprint });
      },

      renameWallet(fingerprint: string, name: string) {
        dispatch(userRenamesWallet({ fingerprint, name }));
        logger.info('Wallet renamed', { fingerprint, name });
      },

      async createAccount(fingerprint: string) {
        await dispatch(createNewAccount(fingerprint));
      },
    }),
    [dispatch]
  );
}
