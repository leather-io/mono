import { useCallback, useRef, useState } from 'react';

import {
  NotifyUserSheetData,
  NotifyUserSheetLayout,
} from '@/components/sheets/notify-user-sheet.layout';
import { useGlobalSheets } from '@/core/global-sheet-provider';
import { AppRoutes } from '@/routes';
import { useSettings } from '@/store/settings/settings';
import { useRouter } from 'expo-router';

import { SheetRef } from '@leather.io/ui/native';

import { AddWalletSheetLayout } from './add-wallet-sheet.layout';

export function AddWalletSheet() {
  const sheetRef = useRef<SheetRef>(null);
  const { themeDerivedFromThemePreference } = useSettings();
  const router = useRouter();
  const { addWalletSheetRef } = useGlobalSheets();
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
        // TODO: this should be set when we call ref.current.present
        opensFully={false}
      />
      <NotifyUserSheetLayout
        onCloseSheet={onCloseSheet}
        sheetData={sheetData}
        sheetRef={sheetRef}
      />
    </>
  );
}
