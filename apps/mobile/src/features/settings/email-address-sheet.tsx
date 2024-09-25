import { RefObject, useState } from 'react';

import { TextInput } from '@/components/text-input';
import { useToastContext } from '@/components/toast/toast-context';
import { useSettings } from '@/store/settings/settings';
import { t } from '@lingui/macro';
import { z } from 'zod';

import { emailAddressSchema } from '@leather.io/models';
import { Button, EmailIcon, SheetRef, Text, UIBottomSheetTextInput } from '@leather.io/ui/native';

import { SettingsSheetLayout } from './settings-sheet.layout';

interface EmailAddressSheetProps {
  sheetRef: RefObject<SheetRef>;
}
export function EmailAddressSheet({ sheetRef }: EmailAddressSheetProps) {
  const [emailAddress, setEmailAddress] = useState('');
  const settings = useSettings();
  const { displayToast } = useToastContext();

  function onSaveEmailAddress(address: string) {
    try {
      emailAddressSchema.parse(address);
    } catch (err) {
      if (err instanceof z.ZodError) {
        displayToast({ title: t`Invalid email address`, type: 'error' });
        return;
      }
    }

    settings.changeEmailAddressPreference(address);
    sheetRef.current?.close();
    displayToast({ title: t`Submitted, check your email`, type: 'success' });
  }

  return (
    <SettingsSheetLayout icon={<EmailIcon />} sheetRef={sheetRef} title={t`Email address`}>
      <Text>{t`Provide an email address for receiving notifications`}</Text>
      <TextInput
        autoCapitalize="none"
        autoComplete="off"
        autoCorrect={false}
        autoFocus
        inputState="focused"
        onChangeText={text => setEmailAddress(text)}
        placeholder={t`Email address`}
        TextInputComponent={UIBottomSheetTextInput}
        value={emailAddress}
      />
      <Button
        buttonState="default"
        onPress={() => onSaveEmailAddress(emailAddress)}
        title={t`Save`}
      />
    </SettingsSheetLayout>
  );
}
