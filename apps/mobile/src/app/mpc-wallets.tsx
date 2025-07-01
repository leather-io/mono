import { useRef, useState } from 'react';

import { Screen } from '@/components/screen/screen';
import { SettingsList } from '@/components/settings/settings-list';
import { SettingsListItem } from '@/components/settings/settings-list-item';
import {
  NotifyUserSheetData,
  NotifyUserSheetLayout,
} from '@/components/sheets/notify-user-sheet.layout';
import { WaitlistIds } from '@/features/waitlist/ids';
import { t } from '@lingui/macro';

import {
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
      id: WaitlistIds.bitgo,
    },
    capsule: {
      title: t({
        id: 'mpc_wallets.capsule',
        message: 'Capsule',
      }),
      icon: <LogoMpcCapsule />,
      id: WaitlistIds.capsule,
    },
    copper: {
      title: t({
        id: 'mpc_wallets.copper',
        message: 'Copper',
      }),
      icon: <LogoMpcCopper />,
      id: WaitlistIds.copper,
    },
    fireblocks: {
      title: t({
        id: 'mpc_wallets.fireblocks',
        message: 'Fireblocks',
      }),
      icon: <LogoMpcFireblocks />,
      id: WaitlistIds.fireblocks,
    },
    foredefi: {
      title: t({
        id: 'mpc_wallets.fordefi',
        message: 'Fordefi',
      }),
      icon: <LogoMpcFordefi />,

      id: WaitlistIds.foredefi,
    },
    portal: {
      title: t({
        id: 'mpc_wallets.portal',
        message: 'Portal',
      }),
      icon: <LogoMpcPortal />,
      id: WaitlistIds.portal,
    },
    privy: {
      title: t({
        id: 'mpc_wallets.privy',
        message: 'Privy',
      }),
      icon: <LogoMpcPrivy />,
      id: WaitlistIds.privy,
    },
    qredo: {
      title: t({
        id: 'mpc_wallets.oredo',
        message: 'Qredo',
      }),
      icon: <LogoMpcQredo />,
      id: WaitlistIds.qredo,
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

  const pageTitle = t({
    id: 'mpc_wallets.title',
    message: 'Connect MPC wallet',
  });

  return (
    <Screen>
      <Screen.Header />
      <Screen.ScrollView>
        <Screen.Title>{pageTitle}</Screen.Title>
        <SettingsList>
          {Object.values(getUnavailableFeatures()).map(feature => {
            function onPress() {
              onOpenSheet({
                id: feature.id,
                title: t({
                  id: 'notify_user.mpc_wallet.header_title',
                  message: 'Connect MPC wallet',
                }),
              });
            }

            return (
              <SettingsListItem
                key={feature.id}
                onPress={onPress}
                title={feature.title}
                icon={feature.icon}
              />
            );
          })}
        </SettingsList>
      </Screen.ScrollView>
      <NotifyUserSheetLayout
        onCloseSheet={onCloseSheet}
        sheetData={sheetData}
        sheetRef={sheetRef}
      />
    </Screen>
  );
}
