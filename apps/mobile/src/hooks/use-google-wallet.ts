import { useCallback, useState } from 'react';

import { useToastContext } from '@/components/toast/toast-context';
import { useKeyStore } from '@/store/key-store';
import { mnemonicStore, tempMnemonicStore } from '@/store/storage-persistors';
import { useAppDispatch } from '@/store/utils';
import { WalletStore } from '@/store/wallets/utils';
import {
  userClearsWalletGoogleMetadata,
  userMarksWalletAsGoogle,
} from '@/store/wallets/wallets.write';
import { t } from '@lingui/core/macro';
import {
  GoogleSignin,
  isCancelledResponse,
  isErrorWithCode,
  statusCodes,
} from '@react-native-google-signin/google-signin';
import { useRouter } from 'expo-router';
import { z } from 'zod';

import { generateMnemonic, getMnemonicRootKeyFingerprint } from '@leather.io/crypto';
import {
  createGoogleDriveWallet,
  extractBackupWalletId,
  selectBackupByWalletName,
} from '@leather.io/services';

import { useCreateWallet } from './use-create-wallet';

const GOOGLE_WALLET_NAME = 'Leather';

export type GoogleUserData = z.infer<typeof googleUserDataSchema>;

export const googleUserDataSchema = z.object({
  googleId: z.string(),
  email: z.string(),
  photo: z.string().nullable(),
  familyName: z.string().nullable(),
  givenName: z.string().nullable(),
});

// used to attach Google account info to the wallet store
function getWalletGoogleData(): GoogleUserData {
  const userInfo = GoogleSignin.getCurrentUser();
  return {
    googleId: userInfo?.user.id as string,
    email: userInfo?.user.email as string,
    photo: userInfo?.user.photo ?? null,
    familyName: userInfo?.user.familyName ?? null,
    givenName: userInfo?.user.givenName ?? null,
  };
}

export function useGoogleWallet() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { displayToast } = useToastContext();
  const { createWallet } = useCreateWallet();
  const { isWalletInKeychain } = useKeyStore();

  const [isLoading, setIsLoading] = useState(false);

  const getGoogleAccessToken = useCallback(async (): Promise<string | null> => {
    await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
    try {
      const hasPrev = GoogleSignin.hasPreviousSignIn();
      if (!hasPrev) {
        const resp = await GoogleSignin.signIn();
        if (isCancelledResponse(resp)) {
          return null;
        }
      }
      const tokens = await GoogleSignin.getTokens();
      return tokens?.accessToken ?? null;
    } catch (err) {
      if (isErrorWithCode(err) && err.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        throw err;
      }
      throw err;
    }
  }, []);

  const signInWithGoogle = useCallback(async () => {
    if (isLoading) return;
    setIsLoading(true);

    try {
      const accessToken = await getGoogleAccessToken();
      if (!accessToken) return;

      const driveWallet = createGoogleDriveWallet(accessToken);
      const backupExists = (await driveWallet.listBackups()).length > 0;

      router.push(backupExists ? '/import-google-restore' : '/import-google-new');
    } catch (error) {
      displayToast({
        title:
          isErrorWithCode(error) && error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE
            ? t`Google Play Services Required`
            : t`Sign-In Failed`,
        type: 'error',
      });
    } finally {
      setIsLoading(false);
    }
  }, [getGoogleAccessToken, isLoading, displayToast, router]);

  const createGoogleWallet = useCallback(
    async (password: string) => {
      setIsLoading(true);
      try {
        const accessToken = await getGoogleAccessToken();
        if (!accessToken) return;

        const mnemonic = generateMnemonic();
        await tempMnemonicStore.setTemporaryMnemonic(mnemonic);

        const backupManager = createGoogleDriveWallet(accessToken);
        const walletId = await getMnemonicRootKeyFingerprint(mnemonic);

        const result = await backupManager.createBackup({
          mnemonic,
          password: password,
          walletId,
          walletName: GOOGLE_WALLET_NAME,
        });

        if (!result.success) {
          throw new Error(result.error || 'Backup failed');
        }

        const googleData = getWalletGoogleData();

        await createWallet({ biometrics: false, googleData });

        displayToast({
          title: t`Wallet Created Successfully`,
          type: 'success',
        });
      } catch (error) {
        displayToast({
          title: t`Backup Failed`,
          type: 'error',
        });
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [createWallet, displayToast, getGoogleAccessToken]
  );

  const restoreGoogleWallet = useCallback(
    async (password: string) => {
      setIsLoading(true);
      try {
        const accessToken = await getGoogleAccessToken();
        if (!accessToken) return;

        const driveWallet = createGoogleDriveWallet(accessToken);

        const backups = await driveWallet.listBackups();
        const backup = selectBackupByWalletName(backups, GOOGLE_WALLET_NAME);
        const walletId = extractBackupWalletId(backup);
        if (!walletId) {
          throw new Error('No backup found');
        }

        const data = await driveWallet.restoreBackup({
          walletId,
          password: password,
        });

        if (!data.success || !data.mnemonic) {
          throw new Error(t`Invalid password corrupted`);
        }

        const fingerprint = await getMnemonicRootKeyFingerprint(data.mnemonic, data.passphrase);

        if (isWalletInKeychain({ fingerprint })) {
          throw new Error('Wallet already exists');
        }

        await tempMnemonicStore.setTemporaryMnemonic(data.mnemonic, data.passphrase);

        const googleData = getWalletGoogleData();

        await createWallet({ biometrics: false, googleData });

        displayToast({
          title: t`Wallet Restored Successfully`,
          type: 'success',
        });
      } catch (error) {
        displayToast({
          title: t`Restore Failed`,
          type: 'error',
        });
        throw new Error(`${error}`);
      } finally {
        setIsLoading(false);
      }
    },
    [createWallet, getGoogleAccessToken, isWalletInKeychain, displayToast]
  );

  const deleteCloudBackup = useCallback(
    async (walletId: string) => {
      setIsLoading(true);
      try {
        const accessToken = await getGoogleAccessToken();
        if (!accessToken) return;

        const driveWallet = createGoogleDriveWallet(accessToken);
        const result = await driveWallet.deleteBackup(walletId);

        if (!result.success) {
          throw new Error(result.error || 'Delete failed');
        }

        displayToast({
          title: t`Backup Deleted Successfully`,
          type: 'success',
        });
      } catch (error) {
        displayToast({
          title: t`Failed to Delete Backup`,
          type: 'error',
        });
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [displayToast, getGoogleAccessToken]
  );

  const deleteForgotPasswordBackup = useCallback(async () => {
    const accessToken = await getGoogleAccessToken();
    if (!accessToken) return;
    const driveWallet = createGoogleDriveWallet(accessToken);
    const backups = await driveWallet.listBackups();

    const backup = selectBackupByWalletName(backups, GOOGLE_WALLET_NAME);
    const walletId = extractBackupWalletId(backup);

    if (!walletId) {
      throw new Error('No backup found to delete');
    }
    await deleteCloudBackup(walletId);
    if (isWalletInKeychain({ fingerprint: walletId })) {
      dispatch(userClearsWalletGoogleMetadata({ fingerprint: walletId }));
    }
  }, [deleteCloudBackup, getGoogleAccessToken, isWalletInKeychain, dispatch]);

  const prepareGoogleBackup = useCallback(async (): Promise<boolean | null> => {
    if (isLoading) return null;

    setIsLoading(true);
    try {
      const accessToken = await getGoogleAccessToken();
      if (!accessToken) return null;

      const driveWallet = createGoogleDriveWallet(accessToken);
      const backups = await driveWallet.listBackups();

      return backups.length > 0;
    } catch {
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [getGoogleAccessToken, isLoading]);

  const backupExistingWallet = useCallback(
    async ({
      fingerprint,
      password,
      confirmOverride,
    }: {
      fingerprint: string;
      password: string;
      confirmOverride: () => Promise<boolean>;
    }) => {
      if (isLoading) return { success: false, reason: 'busy' as const };

      setIsLoading(true);

      try {
        const accessToken = await getGoogleAccessToken();
        if (!accessToken) return;

        const { mnemonic, passphrase } = await mnemonicStore(fingerprint).getMnemonic();
        const walletId = await getMnemonicRootKeyFingerprint(mnemonic, passphrase);

        const driveWallet = createGoogleDriveWallet(accessToken);
        const backups = await driveWallet.listBackups();
        const existingBackup = selectBackupByWalletName(backups, GOOGLE_WALLET_NAME);
        const existingBackupId = extractBackupWalletId(existingBackup);

        if (existingBackupId) {
          const shouldOverride = await confirmOverride();
          if (!shouldOverride) {
            return { success: false, reason: 'cancelled' as const };
          }

          const deleteResult = await driveWallet.deleteBackup(existingBackupId);

          if (!deleteResult.success) {
            throw new Error(deleteResult.error || 'Failed to delete existing backup');
          }
        }

        const createResult = await driveWallet.createBackup({
          mnemonic,
          passphrase,
          password,
          walletId,
          walletName: GOOGLE_WALLET_NAME,
        });

        if (!createResult.success) {
          throw new Error(createResult.error || 'Backup failed');
        }

        const googleData = getWalletGoogleData();
        dispatch(userMarksWalletAsGoogle({ fingerprint, googleData }));

        displayToast({
          title: existingBackupId ? t`Cloud backup updated` : t`Cloud backup created`,
          type: 'success',
        });

        return { success: true as const };
      } catch (error) {
        if (isErrorWithCode(error) && error.code === statusCodes.SIGN_IN_CANCELLED) {
          return { success: false, reason: 'cancelled' as const };
        }

        displayToast({
          title: t`Cloud backup failed`,
          type: 'error',
        });

        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [dispatch, displayToast, getGoogleAccessToken, isLoading]
  );

  return {
    signInWithGoogle,
    createGoogleWallet,
    restoreGoogleWallet,
    deleteCloudBackup,
    deleteForgotPasswordBackup,
    prepareGoogleBackup,
    backupExistingWallet,
    isLoading,
  };
}

export function isGoogleWallet(wallet: WalletStore): boolean {
  return wallet.type === 'software' && !!wallet.googleData;
}
