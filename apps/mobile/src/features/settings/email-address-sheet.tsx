import { InputSheetLayout } from '@/components/sheets/input-sheet.layout';
import { useToastContext } from '@/components/toast/toast-context';
import { useSettings } from '@/store/settings/settings';
import { t } from '@lingui/core/macro';
import { z } from 'zod';

import { emailAddressSchema } from '@leather.io/models';
import { SheetRef } from '@leather.io/ui/native';

interface EmailAddressSheetProps {
  sheetRef: SheetRef;
}
export function EmailAddressSheet({ sheetRef }: EmailAddressSheetProps) {
  const settings = useSettings();
  const { displayToast } = useToastContext();

  function onSaveEmailAddress(address: string) {
    try {
      emailAddressSchema.parse(address);
    } catch (err) {
      if (err instanceof z.ZodError) {
        displayToast({
          title: t`Invalid email address`,
          type: 'error',
        });
        return;
      }
    }

    settings.changeEmailAddressPreference(address);
    sheetRef.current?.close();
    displayToast({
      title: t`Check your email for verification`,
      type: 'success',
    });
  }

  return (
    <InputSheetLayout
      sheetRef={sheetRef}
      initialValue=""
      title={t`Email address`}
      description={t`Provide an email address for receiving notifications`}
      placeholder={t`Email address`}
      submitTitle={t`Save`}
      onSubmit={onSaveEmailAddress}
    />
  );
}
