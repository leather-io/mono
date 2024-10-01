import { RefObject, useCallback, useRef } from 'react';

import { AddWalletSheet } from '@/components/add-wallet/';
import { AppRoutes } from '@/routes';
import { useSettings } from '@/store/settings/settings';
import { useRouter } from 'expo-router';

import { SheetRef } from '@leather.io/ui/native';

import { AddAccountSheetLayout } from './add-account-sheet.layout';

interface AddAccountSheetBaseProps {
  addAccountSheetRef: RefObject<SheetRef>;
}

export function AddAccountSheet({ addAccountSheetRef }: AddAccountSheetBaseProps) {
  const addWalletSheetRef = useRef<SheetRef>(null);
  const { themeDerivedFromThemePreference } = useSettings();
  const router = useRouter();
  const addToWallet = useCallback(() => {
    router.navigate(AppRoutes.SettingsWallet);
    addAccountSheetRef.current?.close();
  }, [addAccountSheetRef, router]);

  const addToNewWallet = useCallback(() => {
    addWalletSheetRef.current?.present();
    addAccountSheetRef.current?.close();
  }, [addAccountSheetRef, router]);

  return (
    <>
      <AddAccountSheetLayout
        addToWallet={addToWallet}
        addToNewWallet={addToNewWallet}
        addAccountSheetRef={addAccountSheetRef}
        themeVariant={themeDerivedFromThemePreference}
      />

      <AddWalletSheet addWalletSheetRef={addWalletSheetRef} />
    </>
  );
}
