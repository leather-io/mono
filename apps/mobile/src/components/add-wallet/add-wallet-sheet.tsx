import { RefObject, useCallback, useRef, useState } from 'react';

import { APP_ROUTES } from '@/routes';
import { useSettings } from '@/store/settings/settings.write';
import { useRouter } from 'expo-router';

import { SheetRef } from '@leather.io/ui/native';

import { NotifyUserSheet, OptionData } from '../sheets/notify-user-sheet';
import { AddWalletSheetLayout } from './add-wallet-sheet.layout';

interface AddWalletSheetBaseProps {
  addWalletSheetRef: RefObject<SheetRef>;
}

export function AddWalletSheet({ addWalletSheetRef }: AddWalletSheetBaseProps) {
  const notifyUserModalRef = useRef<SheetRef>(null);
  const { theme: themeVariant } = useSettings();
  const router = useRouter();
  const [optionData, setOptionData] = useState<OptionData | null>(null);
  const createWallet = useCallback(() => {
    router.navigate(APP_ROUTES.WalletCreateNewWallet);
    addWalletSheetRef.current?.close();
  }, [router]);

  const restoreWallet = useCallback(() => {
    router.navigate(APP_ROUTES.WalletRecoverWallet);
    addWalletSheetRef.current?.close();
  }, [router]);

  function onOpenNotificationsModal(option: OptionData) {
    setOptionData(option);
    notifyUserModalRef.current?.present();
  }
  function onCloseNotificationsModal() {
    setOptionData(null);
  }

  return (
    <>
      <AddWalletSheetLayout
        onOpenNotificationsModal={onOpenNotificationsModal}
        createWallet={createWallet}
        restoreWallet={restoreWallet}
        addWalletSheetRef={addWalletSheetRef}
        themeVariant={themeVariant}
      />

      <NotifyUserSheet
        optionData={optionData}
        onCloseNotificationsModal={onCloseNotificationsModal}
        notifyUserModalRef={notifyUserModalRef}
      />
    </>
  );
}
