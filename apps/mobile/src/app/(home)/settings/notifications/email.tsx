import { useRef } from 'react';

import { EmailAddressSheet } from '@/features/settings/email-address-sheet';
import { t } from '@lingui/macro';

import { Cell, EmailIcon, SheetRef } from '@leather.io/ui/native';

import SettingsScreenLayout from '../settings-screen.layout';

export default function SettingsNotificationsEmailScreen() {
  const emailAddressSheetRef = useRef<SheetRef>(null);

  return (
    <>
      <SettingsScreenLayout>
        <Cell.Root
          title={t`Email address`}
          caption={t`Awaiting verification`}
          icon={<EmailIcon />}
          onPress={() => {
            emailAddressSheetRef.current?.present();
          }}
        >
          <Cell.Chevron />
        </Cell.Root>
      </SettingsScreenLayout>
      <EmailAddressSheet sheetRef={emailAddressSheetRef} />
    </>
  );
}
