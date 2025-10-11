import { useCallback } from 'react';

import { useGlobalSheets } from '@/core/global-sheet-provider';
import { useGoogleWallet } from '@/hooks/use-google-wallet';
import { useRouter } from 'expo-router';

import { AddWalletSheetLayout } from './add-wallet-sheet.layout';

export function AddWalletSheet() {
  const router = useRouter();
  const { addWalletSheetRef } = useGlobalSheets();
  const { signInWithGoogle } = useGoogleWallet();
  const createWallet = useCallback(() => {
    router.navigate('/create-new-wallet');
    addWalletSheetRef.current?.close();
  }, [addWalletSheetRef, router]);

  const restoreWallet = useCallback(() => {
    router.navigate('/recover-wallet');
    addWalletSheetRef.current?.close();
  }, [addWalletSheetRef, router]);
  const handleGoogle = useCallback(async () => {
    await signInWithGoogle();
    addWalletSheetRef.current?.close();
  }, [addWalletSheetRef, signInWithGoogle]);

  return (
    <AddWalletSheetLayout
      createWallet={createWallet}
      restoreWallet={restoreWallet}
      googleWallet={handleGoogle}
      addWalletSheetRef={addWalletSheetRef}
      // TODO: this should be set when we call ref.current.present
      opensFully={false}
    />
  );
}
