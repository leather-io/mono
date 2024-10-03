import { useRef } from 'react';

import { EmailAddressSheet } from '@/features/settings/email-address-sheet';
import { t } from '@lingui/macro';

import { Cell, EmailIcon, SheetRef } from '@leather.io/ui/native';

import SettingsScreenLayout from '../settings-screen.layout';

// TODO: Hook up to email service when available
export default function SettingsNotificationsEmailScreen() {
  const emailAddressSheetRef = useRef<SheetRef>(null);

  return (
    <>
      <SettingsScreenLayout>
        <Cell.Root
          title={t({
            id: 'notifications.email.cell_title',
            message: 'Email address',
          })}
          caption={t({
            id: 'notifications.email.cell_caption',
            message: 'Placeholder',
          })}
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
