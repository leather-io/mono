import { useToastContext } from '@/components/toast/toast-context';
import { APP_ROUTES } from '@/routes';
import { keychainErrorHandlers, useKeyStore } from '@/store/key-store';
import { useSettings } from '@/store/settings/settings.write';
import { tempMnemonicStore } from '@/store/storage-persistors';
import { nextAnimationFrame } from '@/utils/next-animation-frame';
import { t } from '@lingui/macro';
import { useRouter } from 'expo-router';

export function useCreateWallet() {
  const router = useRouter();
  const toastContext = useToastContext();
  const keyStore = useKeyStore();
  const { walletSecurityLevel, changeWalletSecurityLevel } = useSettings();
  async function createWallet({ biometrics }: { biometrics: boolean }) {
    changeWalletSecurityLevel(biometrics ? 'secure' : 'insecure');
    const { mnemonic, passphrase } = await tempMnemonicStore.getTemporaryMnemonic();
    if (mnemonic) {
      router.navigate(APP_ROUTES.WalletGeneratingWallet);
      await nextAnimationFrame();
      try {
        await keyStore.restoreWalletFromMnemonic({
          mnemonic,
          biometrics,
          passphrase: passphrase ?? undefined,
        });
        toastContext.displayToast({ type: 'success', title: t`Wallet added successfully` });
        router.navigate(APP_ROUTES.WalletHome);
      } catch (e) {
        if (keychainErrorHandlers.isKeyExistsError(e)) {
          toastContext.displayToast({ type: 'info', title: t`Wallet already exists` });
          router.back();
          return;
        }
        toastContext.displayToast({ type: 'info', title: t`Something went wrong` });
        router.back();
      }
    }
  }

  async function navigateAndCreateWallet() {
    switch (walletSecurityLevel) {
      case 'undefined':
        router.navigate(APP_ROUTES.WalletSecureYourWallet);
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
          "walletSecurityLevel is undefined. That shouldn't happen in a newly created store"
        );
        router.navigate(APP_ROUTES.WalletSecureYourWallet);
    }
  }

  return { createWallet, navigateAndCreateWallet };
}
