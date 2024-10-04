import { useRef, useState } from 'react';

import { MpcWalletListLayout } from '@/components/mpc-wallet/mpc-wallet-list.layout';
import { NotifyUserSheet, NotifyUserSheetData } from '@/components/sheets/notify-user-sheet.layout';
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
    bitgo: { title: t`BitGo`, icon: <LogoMpcBitgo /> },
    capsule: { title: t`Capsule`, icon: <LogoMpcCapsule /> },
    copper: { title: t`Copper`, icon: <LogoMpcCopper /> },
    fireblocks: { title: t`Fireblocks`, icon: <LogoMpcFireblocks /> },
    foredefi: { title: t`Foredefi`, icon: <LogoMpcFordefi /> },
    portal: { title: t`Portal`, icon: <LogoMpcPortal /> },
    privy: { title: t`Privy`, icon: <LogoMpcPrivy /> },
    qredo: { title: t`Qredo`, icon: <LogoMpcQredo /> },
  };
}

export default function MpcWalletListScreen() {
  const sheetRef = useRef<SheetRef>(null);
  const [sheetData, setSheetData] = useState<NotifyUserSheetData | null>(null);

  function onOpenSheet(option: NotifyUserSheetData) {
    setSheetData(option);
    sheetRef.current?.present();
  }

  function onCloseSheet() {
    setSheetData(null);
  }

  return (
    <>
      <MpcWalletListLayout>
        <Box gap="1" pt="5">
          {Object.entries(getUnavailableFeatures()).map(featureEntry => {
            const [featureKey, feature] = featureEntry;
            const mpcWalletName = feature.title;
            function onPress() {
              onOpenSheet({
                title: t`Connect Mpc wallet: ${mpcWalletName}`,
              });
            }
            return (
              <Cell.Root
                py="4"
                key={featureKey}
                onPress={onPress}
                title={feature.title}
                icon={feature.icon}
              >
                <Cell.Chevron />
              </Cell.Root>
            );
          })}
        </Box>
      </MpcWalletListLayout>

      <NotifyUserSheet onCloseSheet={onCloseSheet} sheetData={sheetData} sheetRef={sheetRef} />
    </>
  );
}
