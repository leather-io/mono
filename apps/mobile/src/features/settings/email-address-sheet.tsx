import { RefObject, useState } from 'react';

import { SheetLayout } from '@/components/sheets/sheet.layout';
import { TextInput } from '@/components/text-input';
import { useToastContext } from '@/components/toast/toast-context';
import { useSettings } from '@/store/settings/settings';
import { t } from '@lingui/macro';
import { z } from 'zod';

import { emailAddressSchema } from '@leather.io/models';
import { Button, SheetRef, Text, UIBottomSheetTextInput } from '@leather.io/ui/native';

interface EmailAddressSheetProps {
  sheetRef: RefObject<SheetRef | null>;
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
        displayToast({
          title: t({
            id: 'email_address.toast_title_error',
            message: 'Invalid email address',
          }),
          type: 'error',
        });
        return;
      }
    }

    settings.changeEmailAddressPreference(address);
    sheetRef.current?.close();
    displayToast({
      title: t({
        id: 'email_address.toast_title_success',
        message: 'Submitted, check your email',
      }),
      type: 'success',
    });
  }

  return (
    <SheetLayout
      sheetRef={sheetRef}
      title={t({
        id: 'email_address.header_title',
        message: 'Email address',
      })}
    >
      <Text>
        {t({
          id: 'email_address.subtitle',
          message: 'Provide an email address for receiving notifications',
        })}
      </Text>
      <TextInput
        autoCapitalize="none"
        autoComplete="off"
        autoCorrect={false}
        autoFocus
        inputState="focused"
        onChangeText={text => setEmailAddress(text)}
        placeholder={t({
          id: 'email_address.input_placeholder',
          message: 'Email address',
        })}
        TextInputComponent={UIBottomSheetTextInput}
        value={emailAddress}
      />
      <Button
        mt="3"
        buttonState="default"
        onPress={() => onSaveEmailAddress(emailAddress)}
        title={t({
          id: 'email_address.save_button',
          message: 'Save',
        })}
      />
    </SheetLayout>
  );
}
