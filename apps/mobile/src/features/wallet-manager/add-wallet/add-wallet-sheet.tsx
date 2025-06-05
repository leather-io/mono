import { useCallback } from 'react';

import { useGlobalSheets } from '@/core/global-sheet-provider';
import { useRouter } from 'expo-router';

import { AddWalletSheetLayout } from './add-wallet-sheet.layout';

export function AddWalletSheet() {
  const router = useRouter();
  const { addWalletSheetRef } = useGlobalSheets();
  const createWallet = useCallback(() => {
    router.navigate('/create-new-wallet');
    addWalletSheetRef.current?.close();
  }, [addWalletSheetRef, router]);

  const restoreWallet = useCallback(() => {
    router.navigate('/recover-wallet');
    addWalletSheetRef.current?.close();
  }, [addWalletSheetRef, router]);

  return (
    <AddWalletSheetLayout
      createWallet={createWallet}
      restoreWallet={restoreWallet}
      addWalletSheetRef={addWalletSheetRef}
      // TODO: this should be set when we call ref.current.present
      opensFully={false}
    />
  );
}
