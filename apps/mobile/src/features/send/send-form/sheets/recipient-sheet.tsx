import { RefObject } from 'react';
import { Controller, useFormContext } from 'react-hook-form';

import { TextInput } from '@/components/text-input';
import { useSettings } from '@/store/settings/settings';
import { t } from '@lingui/macro';
import { z } from 'zod';

import { Box, Sheet, SheetRef, UIBottomSheetTextInput } from '@leather.io/ui/native';

import { useSendFormContext } from '../send-form-context';

interface RecipientSheetProps {
  sheetRef: RefObject<SheetRef>;
}
export function RecipientSheet({ sheetRef }: RecipientSheetProps) {
  const { schema } = useSendFormContext();
  const { control } = useFormContext<z.infer<typeof schema>>();
  const { themeDerivedFromThemePreference } = useSettings();

  return (
    <Sheet ref={sheetRef} themeVariant={themeDerivedFromThemePreference}>
      <Box pt="5" px="5">
        <Controller
          control={control}
          name="recipient"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              autoCapitalize="none"
              autoComplete="off"
              autoCorrect={false}
              autoFocus
              inputState="focused"
              onBlur={onBlur}
              onChangeText={value => onChange(value)}
              placeholder={t({
                id: 'recipient-sheet.recipient.input.placeholder',
                message: 'Enter recipient',
              })}
              TextInputComponent={UIBottomSheetTextInput}
              value={value}
            />
          )}
          rules={{
            required: t({
              id: 'recipient-sheet.recipient.error.recipient_required',
              message: 'Recipient is required',
            }),
          }}
        />
      </Box>
    </Sheet>
  );
}
