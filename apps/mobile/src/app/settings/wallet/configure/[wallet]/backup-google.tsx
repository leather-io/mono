import { useCallback, useRef, useState } from 'react';

import { GoogleWalletOverrideSheet } from '@/features/settings/wallet-and-accounts/override-wallet-google-sheet';
import { GooglePasswordScreen } from '@/features/wallet-manager/import-google-wallet/google-password-screen';
import { useGoogleWallet } from '@/hooks/use-google-wallet';
import { WalletLoader } from '@/store/wallets/wallets.read';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { z } from 'zod';

import { SheetInstance } from '@leather.io/ui/native';

const paramsSchema = z.object({
  fingerprint: z.string(),
  skipOverridePrompt: z.enum(['0', '1']).optional(),
});

export default function BackupGoogleScreen() {
  const params = paramsSchema.parse(useLocalSearchParams());
  const router = useRouter();
  const { backupExistingWallet, isLoading } = useGoogleWallet();

  const overrideSheetRef = useRef<SheetInstance>(null);
  const overrideResolverRef = useRef<((value: boolean) => void) | null>(null);

  const [password, setPassword] = useState('');
  const [error, setError] = useState<string>();

  const confirmOverride = useCallback(() => {
    if (params.skipOverridePrompt === '1') return Promise.resolve(true);

    return new Promise<boolean>(resolve => {
      overrideResolverRef.current = resolve;
      overrideSheetRef.current?.present();
    });
  }, [params.skipOverridePrompt]);

  const handleOverrideDecision = useCallback((shouldOverride: boolean) => {
    overrideSheetRef.current?.dismiss();
    overrideResolverRef.current?.(shouldOverride);
    overrideResolverRef.current = null;
  }, []);

  const handleBackup = useCallback(
    async (fingerprint: string) => {
      setError(undefined);

      try {
        const result = await backupExistingWallet({
          fingerprint,
          password,
          confirmOverride,
        });

        if (result?.success) router.back();
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err));
      }
    },
    [backupExistingWallet, password, confirmOverride, router]
  );

  return (
    <WalletLoader fingerprint={params.fingerprint} fallback={null}>
      {wallet => (
        <>
          <GooglePasswordScreen
            mode="create"
            password={password}
            onPasswordChange={setPassword}
            onContinue={() => handleBackup(wallet.fingerprint)}
            isLoading={isLoading}
            error={error}
          />
          <GoogleWalletOverrideSheet
            sheetRef={overrideSheetRef}
            onConfirm={() => handleOverrideDecision(true)}
            onCancel={() => handleOverrideDecision(false)}
          />
        </>
      )}
    </WalletLoader>
  );
}
