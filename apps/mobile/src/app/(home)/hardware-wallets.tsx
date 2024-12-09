import { useRef, useState } from 'react';

import { AnimatedHeaderScreenLayout } from '@/components/headers/animated-header/animated-header-screen.layout';
import { SettingsList } from '@/components/settings/settings-list';
import { SettingsListItem } from '@/components/settings/settings-list-item';
import {
  NotifyUserSheetData,
  NotifyUserSheetLayout,
} from '@/components/sheets/notify-user-sheet.layout';
import { WaitlistIds } from '@/features/waitlist/ids';
import { t } from '@lingui/macro';

import {
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
    bitkey: {
      title: t({
        id: 'hardware_wallets.bitkey',
        message: 'Bitkey',
      }),
      icon: <LogoHardwareBitkey />,
      id: WaitlistIds.bitkey,
    },
    capsule: {
      title: t({
        id: 'hardware_wallets.ledger',
        message: 'Ledger',
      }),
      icon: <LogoHardwareLedger />,
      id: WaitlistIds.capsule,
    },
    copper: {
      title: t({
        id: 'hardware_wallets.onekey',
        message: 'OneKey',
      }),
      icon: <LogoHardwareOnekey />,
      id: WaitlistIds.copper,
    },
    fireblocks: {
      title: t({
        id: 'hardware_wallets.passport',
        message: 'Passport',
      }),
      icon: <LogoHardwareFoundation />,
      id: WaitlistIds.fireblocks,
    },
    foredefi: {
      title: t({
        id: 'hardware_wallets.ryder',
        message: 'Ryder',
      }),
      icon: <LogoHardwareRyder />,
      id: WaitlistIds.foredefi,
    },
    portal: {
      title: t({
        id: 'hardware_wallets.trezor',
        message: 'Trezor',
      }),
      icon: <LogoHardwareTrezor />,
      id: WaitlistIds.portal,
    },
  };
}

export default function HardwareWalletListScreen() {
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
          id: 'hardware_wallets.title',
          message: 'Connect device',
        })}
      >
        <SettingsList>
          {Object.values(getUnavailableFeatures()).map(feature => {
            const hardwareWalletName = feature.title;
            function onPress() {
              onOpenSheet({
                title: t({
                  id: 'notify_user.hardware_wallets.header_title',
                  message: `Connect hardware wallet: ${hardwareWalletName}`,
                }),
                id: feature.id,
              });
            }
            return (
              <SettingsListItem
                key={feature.id}
                title={feature.title}
                icon={feature.icon}
                onPress={onPress}
              />
            );
          })}
        </SettingsList>
      </AnimatedHeaderScreenLayout>
      <NotifyUserSheetLayout
        onCloseSheet={onCloseSheet}
        sheetData={sheetData}
        sheetRef={sheetRef}
      />
    </>
  );
}
