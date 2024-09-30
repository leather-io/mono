import { useRef, useState } from 'react';

import { MpcWalletListLayout } from '@/components/mpc-wallet/mpc-wallet-list.layout';
import { NotifyUserSheet, OptionData } from '@/components/sheets/notify-user-sheet.layout';
import { t } from '@lingui/macro';

import {
  Box,
  Cell,
  LogoMpcBitgo,
  LogoMpcCapsule,
  LogoMpcCopper,
  LogoMpcFireblocks,
  LogoMpcFordefi,
  LogoMpcPortal,
  LogoMpcPrivy,
  LogoMpcQredo,
  SheetRef,
} from '@leather.io/ui/native';

function getUnavailableFeatures() {
  return {
    bitgo: { title: t`BitGo`, Icon: LogoMpcBitgo },
    capsule: { title: t`Capsule`, Icon: LogoMpcCapsule },
    copper: { title: t`Copper`, Icon: LogoMpcCopper },
    fireblocks: { title: t`Fireblocks`, Icon: LogoMpcFireblocks },
    foredefi: { title: t`Foredefi`, Icon: LogoMpcFordefi },
    portal: { title: t`Portal`, Icon: LogoMpcPortal },
    privy: { title: t`Privy`, Icon: LogoMpcPrivy },
    qredo: { title: t`Qredo`, Icon: LogoMpcQredo },
  };
}

export default function MpcWalletListScreen() {
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
      <MpcWalletListLayout>
        <Box gap="1" pt="5">
          {Object.entries(getUnavailableFeatures()).map(featureEntry => {
            const [featureKey, feature] = featureEntry;
            const mpcWalletName = feature.title;
            function onPress() {
              onOpenNotificationsSheet({
                title: t`Connect Mpc wallet: ${mpcWalletName}`,
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
      </MpcWalletListLayout>

      <NotifyUserSheet
        optionData={optionData}
        onCloseNotificationsSheet={onCloseNotificationsSheet}
        notifyUserSheetRef={notifyUserSheetRef}
      />
    </>
  );
}
