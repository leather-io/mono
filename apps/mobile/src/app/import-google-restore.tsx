import { useCallback, useRef, useState } from 'react';

import { ForgotPasswordSheet } from '@/features/wallet-manager/import-google-wallet/forgot-password-sheet';
import { GooglePasswordScreen } from '@/features/wallet-manager/import-google-wallet/google-password-screen';
import { useGoogleWallet } from '@/hooks/use-google-wallet';
import { t } from '@lingui/core/macro';
import { useRouter } from 'expo-router';

import { SheetInstance } from '@leather.io/ui/native';

export default function ImportGoogleRestore() {
  const router = useRouter();
  const { restoreGoogleWallet, deleteForgotPasswordBackup, isLoading } = useGoogleWallet();

  const deleteGoogleBackupSheetRef = useRef<SheetInstance>(null);

  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | undefined>();

  const handleRestore = useCallback(async () => {
    try {
      setError(undefined);
      await restoreGoogleWallet(password);
    } catch (err) {
      setError(err instanceof Error ? err.message : t`Restore failed. Please try again.`);
    }
  }, [password, restoreGoogleWallet]);

  const handleDeleteBackup = useCallback(async () => {
    try {
      await deleteForgotPasswordBackup();
      deleteGoogleBackupSheetRef.current?.close();
      router.replace('/import-google-new');
    } catch (err) {
      setError(err instanceof Error ? err.message : t`Failed to delete back-up. Please try again.`);
    }
  }, [deleteForgotPasswordBackup, router]);

  return (
    <>
      <GooglePasswordScreen
        mode="recover"
        password={password}
        onPasswordChange={setPassword}
        onContinue={handleRestore}
        onForgotPassword={() => deleteGoogleBackupSheetRef.current?.present()}
        isLoading={isLoading}
        error={error}
      />
      <ForgotPasswordSheet
        sheetRef={deleteGoogleBackupSheetRef}
        onSubmit={handleDeleteBackup}
        isLoading={isLoading}
      />
    </>
  );
}
