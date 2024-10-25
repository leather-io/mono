import { useRef, useState } from 'react';

import { AnimatedHeaderScreenLayout } from '@/components/headers/animated-header/animated-header-screen.layout';
import {
  NotifyUserSheetData,
  NotifyUserSheetLayout,
} from '@/components/sheets/notify-user-sheet.layout';
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
    bitgo: {
      title: t({
        id: 'mpc_wallets.bitgo',
        message: 'BitGo',
      }),
      icon: <LogoMpcBitgo />,
    },
    capsule: {
      title: t({
        id: 'mpc_wallets.capsule',
        message: 'Capsule',
      }),
      icon: <LogoMpcCapsule />,
    },
    copper: {
      title: t({
        id: 'mpc_wallets.copper',
        message: 'Copper',
      }),
      icon: <LogoMpcCopper />,
    },
    fireblocks: {
      title: t({
        id: 'mpc_wallets.fireblocks',
        message: 'Fireblocks',
      }),
      icon: <LogoMpcFireblocks />,
    },
    foredefi: {
      title: t({
        id: 'mpc_wallets.fordefi',
        message: 'Fordefi',
      }),
      icon: <LogoMpcFordefi />,
    },
    portal: {
      title: t({
        id: 'mpc_wallets.portal',
        message: 'Portal',
      }),
      icon: <LogoMpcPortal />,
    },
    privy: {
      title: t({
        id: 'mpc_wallets.privy',
        message: 'Privy',
      }),
      icon: <LogoMpcPrivy />,
    },
    qredo: {
      title: t({
        id: 'mpc_wallets.oredo',
        message: 'Qredo',
      }),
      icon: <LogoMpcQredo />,
    },
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
      <AnimatedHeaderScreenLayout
        title={t({
          id: 'mpc_wallets.title',
          message: 'Connect mpc wallet',
        })}
      >
        <Box gap="3">
          {Object.entries(getUnavailableFeatures()).map(featureEntry => {
            const [featureKey, feature] = featureEntry;
            const mpcWalletName = feature.title;

            function onPress() {
              onOpenSheet({
                title: t({
                  id: 'notify_user.mpc_wallet.header_title',
                  message: `Connect Mpc wallet: ${mpcWalletName}`,
                }),
              });
            }

            return (
              <Cell.Root
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
      </AnimatedHeaderScreenLayout>
      <NotifyUserSheetLayout
        onCloseSheet={onCloseSheet}
        sheetData={sheetData}
        sheetRef={sheetRef}
      />
    </>
  );
}
