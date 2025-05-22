import { useCallback } from 'react';

import { useGlobalSheets } from '@/core/global-sheet-provider';
import { AppRoutes } from '@/routes';
import { useSettings } from '@/store/settings/settings';
import { useRouter } from 'expo-router';

import { AddAccountSheetLayout } from './add-account-sheet.layout';

export function AddAccountSheet() {
  const { themeDerivedFromThemePreference } = useSettings();
  const router = useRouter();
  const { addAccountSheetRef, addWalletSheetRef } = useGlobalSheets();
  const addToWallet = useCallback(() => {
    router.navigate(AppRoutes.SettingsWallet);
    addAccountSheetRef.current?.close();
  }, [addAccountSheetRef, router]);

  const addToNewWallet = useCallback(() => {
    addWalletSheetRef.current?.present();
    addAccountSheetRef.current?.close();
  }, [addAccountSheetRef, addWalletSheetRef]);

  return (
    <AddAccountSheetLayout
      addToWallet={addToWallet}
      addToNewWallet={addToNewWallet}
      addAccountSheetRef={addAccountSheetRef}
      themeVariant={themeDerivedFromThemePreference}
    />
  );
}
