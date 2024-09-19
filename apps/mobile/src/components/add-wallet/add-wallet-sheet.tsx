import { RefObject, useCallback, useRef, useState } from 'react';

import { AppRoutes } from '@/routes';
import { useSettings } from '@/store/settings/settings';
import { useRouter } from 'expo-router';

import { SheetRef } from '@leather.io/ui/native';

import { NotifyUserSheet, OptionData } from '../sheets/notify-user-sheet.layout';
import { AddWalletSheetLayout } from './add-wallet-sheet.layout';

interface AddWalletSheetBaseProps {
  addWalletSheetRef: RefObject<SheetRef>;
}

export function AddWalletSheet({ addWalletSheetRef }: AddWalletSheetBaseProps) {
  const notifyUserSheetRef = useRef<SheetRef>(null);
  const { themeDerivedFromThemePreference } = useSettings();
  const router = useRouter();
  const [optionData, setOptionData] = useState<OptionData | null>(null);
  const createWallet = useCallback(() => {
    router.navigate(AppRoutes.CreateNewWallet);
    addWalletSheetRef.current?.close();
  }, [addWalletSheetRef, router]);

  const restoreWallet = useCallback(() => {
    router.navigate(AppRoutes.RecoverWallet);
    addWalletSheetRef.current?.close();
  }, [addWalletSheetRef, router]);

  function onOpenNotificationsSheet(option: OptionData) {
    setOptionData(option);
    notifyUserSheetRef.current?.present();
  }
  function onCloseNotificationsSheet() {
    setOptionData(null);
  }

  return (
    <>
      <AddWalletSheetLayout
        onOpenNotificationsSheet={onOpenNotificationsSheet}
        createWallet={createWallet}
        restoreWallet={restoreWallet}
        addWalletSheetRef={addWalletSheetRef}
        themeVariant={themeDerivedFromThemePreference}
      />

      <NotifyUserSheet
        optionData={optionData}
        onCloseNotificationsSheet={onCloseNotificationsSheet}
        notifyUserSheetRef={notifyUserSheetRef}
      />
    </>
  );
}
