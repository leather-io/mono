import { RefObject, useCallback, useRef, useState } from 'react';

import { AppRoutes } from '@/routes';
import { useSettings } from '@/store/settings/settings';
import { useRouter } from 'expo-router';

import { SheetRef } from '@leather.io/ui/native';

import { NotifyUserSheet, NotifyUserSheetData } from '../sheets/notify-user-sheet.layout';
import { AddWalletSheetLayout } from './add-wallet-sheet.layout';

interface AddWalletSheetBaseProps {
  addWalletSheetRef: RefObject<SheetRef>;
}

export function AddWalletSheet({ addWalletSheetRef }: AddWalletSheetBaseProps) {
  const sheetRef = useRef<SheetRef>(null);
  const { themeDerivedFromThemePreference } = useSettings();
  const router = useRouter();
  const [sheetData, setSheetData] = useState<NotifyUserSheetData | null>(null);
  const createWallet = useCallback(() => {
    router.navigate(AppRoutes.CreateNewWallet);
    addWalletSheetRef.current?.close();
  }, [addWalletSheetRef, router]);

  const restoreWallet = useCallback(() => {
    router.navigate(AppRoutes.RecoverWallet);
    addWalletSheetRef.current?.close();
  }, [addWalletSheetRef, router]);

  function onOpenSheet(option: NotifyUserSheetData) {
    setSheetData(option);
    sheetRef.current?.present();
  }

  function onCloseSheet() {
    setSheetData(null);
  }

  return (
    <>
      <AddWalletSheetLayout
        onOpenSheet={onOpenSheet}
        createWallet={createWallet}
        restoreWallet={restoreWallet}
        addWalletSheetRef={addWalletSheetRef}
        themeVariant={themeDerivedFromThemePreference}
      />

      <NotifyUserSheet onCloseSheet={onCloseSheet} sheetData={sheetData} sheetRef={sheetRef} />
    </>
  );
}
