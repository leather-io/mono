import { useToastContext } from '@/components/toast/toast-context';
import { keychainErrorHandlers, useKeyStore } from '@/store/key-store';
import { useSettings } from '@/store/settings/settings';
import { tempMnemonicStore } from '@/store/storage-persistors';
import { nextAnimationFrame } from '@/utils/next-animation-frame';
import { t } from '@lingui/core/macro';
import { useRouter } from 'expo-router';

import { useHaptics } from '@leather.io/ui/native';

export function useCreateWallet() {
  const router = useRouter();
  const toastContext = useToastContext();
  const triggerHapticFeedback = useHaptics();
  const keyStore = useKeyStore();
  const { changeSecurityLevelPreference, securityLevelPreference } = useSettings();

  async function createWallet({
    biometrics,
    isReadonly,
  }: {
    biometrics: boolean;
    isReadonly?: boolean;
  }) {
    changeSecurityLevelPreference(biometrics ? 'secure' : 'insecure');
    const { mnemonic, passphrase } = await tempMnemonicStore.getTemporaryMnemonic();
    if (mnemonic) {
      router.navigate('/generating-wallet');
      await nextAnimationFrame();
      try {
        if (isReadonly) {
          await keyStore.restoreReadonlyWalletFromMnemonic({
            mnemonic,
            biometrics,
            passphrase: passphrase ?? undefined,
            type: 'stx-and-btc',
          });
        } else {
          await keyStore.restoreWalletFromMnemonic({
            mnemonic,
            biometrics,
            passphrase: passphrase ?? undefined,
          });
        }
        void triggerHapticFeedback('success');
        toastContext.displayToast({
          type: 'success',
          title: t`Wallet added`,
        });
        router.dismissAll();
        router.replace('/');
        // be sure to always delete temporary mnemonic if we eventually use it as a wallet
        await tempMnemonicStore.deleteTemporaryMnemonic();
      } catch (e) {
        if (keychainErrorHandlers.isKeyExistsError(e)) {
          toastContext.displayToast({
            type: 'error',
            title: t`Wallet added already`,
          });
          router.back();
          return;
        }
        void triggerHapticFeedback('success');
        toastContext.displayToast({
          type: 'error',
          title: t`An error occurred`,
        });
        router.back();
      }
    }
  }

  async function navigateAndCreateWallet(options?: { isReadonly?: boolean }) {
    switch (securityLevelPreference) {
      case 'not-selected':
        router.navigate({
          pathname: '/secure-your-wallet',
          params: {
            type: options?.isReadonly ? 'read-only' : 'read-write',
          },
        });
        return;
      case 'secure':
        await createWallet({ biometrics: true, isReadonly: options?.isReadonly });
        return;
      case 'insecure':
        await createWallet({ biometrics: false, isReadonly: options?.isReadonly });
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
