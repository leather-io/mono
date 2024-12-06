import { useRef } from 'react';

import { SettingsListItem } from '@/components/settings/settings-list-item';
import { EmailAddressSheet } from '@/features/settings/email-address-sheet';
import { t } from '@lingui/macro';

import { Box, EmailIcon, SheetRef } from '@leather.io/ui/native';

// TODO: Hook up to email service when available
export default function SettingsNotificationsEmailScreen() {
  const emailAddressSheetRef = useRef<SheetRef>(null);

  return (
    <>
      <Box bg="ink.background-primary" flex={1}>
        <Box flex={1} gap="3" paddingTop="5">
          <SettingsListItem
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
          />
        </Box>
      </Box>
      <EmailAddressSheet sheetRef={emailAddressSheetRef} />
    </>
  );
}
