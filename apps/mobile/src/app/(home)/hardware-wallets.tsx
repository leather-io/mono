import { useRef, useState } from 'react';

import { HardwareWalletListLayout } from '@/components/hardware-wallet/hardware-wallet-list.layout';
import { NotifyUserSheet, OptionData } from '@/components/sheets/notify-user-sheet.layout';
import { t } from '@lingui/macro';

import {
  Box,
  Cell,
  LogoHardwareBitkey,
  LogoHardwareFoundation,
  LogoHardwareLedger,
  LogoHardwareOnekey,
  LogoHardwareRyder,
  LogoHardwareTrezor,
  SheetRef,
} from '@leather.io/ui/native';

function getUnavailableFeatures() {
  return {
    bitgo: { title: t`Bitkey`, Icon: LogoHardwareBitkey },
    capsule: { title: t`Ledger`, Icon: LogoHardwareLedger },
    copper: { title: t`OneKey`, Icon: LogoHardwareOnekey },
    fireblocks: { title: t`Passport`, Icon: LogoHardwareFoundation },
    foredefi: { title: t`Ryder`, Icon: LogoHardwareRyder },
    portal: { title: t`Trezor`, Icon: LogoHardwareTrezor },
  };
}

export default function HardwareWalletListScreen() {
  const notifyUserSheetRef = useRef<SheetRef>(null);
  const [optionData, setOptionData] = useState<OptionData | null>(null);
  function onOpenNotificationsSheet(option: OptionData) {
    setOptionData(option);
    notifyUserSheetRef.current?.present();
  }
  function onCloseNotificationsSheet() {
    setOptionData(null);
  }

  return (
    <>
      <HardwareWalletListLayout>
        <Box gap="1" pt="5">
          {Object.entries(getUnavailableFeatures()).map(featureEntry => {
            const [featureKey, feature] = featureEntry;
            const hardwareWalletName = feature.title;
            function onPress() {
              onOpenNotificationsSheet({
                title: t`Connect hardware wallet: ${hardwareWalletName}`,
              });
            }
            return (
              <Cell
                py="4"
                key={featureKey}
                onPress={onPress}
                title={feature.title}
                Icon={feature.Icon}
              />
            );
          })}
        </Box>
      </HardwareWalletListLayout>
      <NotifyUserSheet
        optionData={optionData}
        onCloseNotificationsSheet={onCloseNotificationsSheet}
        notifyUserSheetRef={notifyUserSheetRef}
      />
    </>
  );
}
