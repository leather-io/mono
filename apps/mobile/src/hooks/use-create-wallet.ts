import { useToastContext } from '@/components/toast/toast-context';
import { keychainErrorHandlers, useKeyStore } from '@/store/key-store';
import { useSettings } from '@/store/settings/settings';
import { tempMnemonicStore } from '@/store/storage-persistors';
import { nextAnimationFrame } from '@/utils/next-animation-frame';
import { t } from '@lingui/macro';
import { useRouter } from 'expo-router';

import { useHaptics } from '@leather.io/ui/native';

export function useCreateWallet() {
  const router = useRouter();
  const toastContext = useToastContext();
  const triggerHapticFeedback = useHaptics();
  const keyStore = useKeyStore();
  const { changeSecurityLevelPreference, securityLevelPreference } = useSettings();

  async function createWallet({ biometrics }: { biometrics: boolean }) {
    changeSecurityLevelPreference(biometrics ? 'secure' : 'insecure');
    const { mnemonic, passphrase } = await tempMnemonicStore.getTemporaryMnemonic();
    if (mnemonic) {
      router.navigate('/generating-wallet');
      await nextAnimationFrame();
      try {
        await keyStore.restoreWalletFromMnemonic({
          mnemonic,
          biometrics,
          passphrase: passphrase ?? undefined,
        });
        void triggerHapticFeedback('success');
        toastContext.displayToast({
          type: 'success',
          title: t({
            id: 'create_wallet.toast_title_success',
            message: 'Wallet added successfully',
          }),
        });
        router.dismissAll();
        router.replace('/');
        // be sure to always delete temporary mnemonic if we eventually use it as a wallet
        await tempMnemonicStore.deleteTemporaryMnemonic();
      } catch (e) {
        if (keychainErrorHandlers.isKeyExistsError(e)) {
          toastContext.displayToast({
            type: 'error',
            title: t({
              id: 'create_wallet.wallet_exists.toast_title_error',
              message: 'Wallet already exists',
            }),
          });
          router.back();
          return;
        }
        void triggerHapticFeedback('success');
        toastContext.displayToast({
          type: 'error',
          title: t({
            id: 'create_wallet.toast_title_error',
            message: 'Something went wrong',
          }),
        });
        router.back();
      }
    }
  }

  async function navigateAndCreateWallet() {
    switch (securityLevelPreference) {
      case 'not-selected':
        router.navigate('/secure-your-wallet');
        return;
      case 'secure':
        await createWallet({ biometrics: true });
        return;
      case 'insecure':
        await createWallet({ biometrics: false });
        return;
      default:
        /* eslint-disable-next-line no-console  */
        console.warn(
          "securityLevelPreference is undefined. That shouldn't happen in a newly created store"
        );
        router.navigate('/secure-your-wallet');
    }
  }

  return { createWallet, navigateAndCreateWallet };
}
