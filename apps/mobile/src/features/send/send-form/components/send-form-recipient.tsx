import { useState } from 'react';
import { useController, useFormContext } from 'react-hook-form';

import { TextInput } from '@/components/text-input';
import { t } from '@lingui/macro';
import { z } from 'zod';

import {
  AddressDisplayer,
  Avatar,
  Box,
  Flag,
  Pressable,
  UIBottomSheetTextInput,
  UserIcon,
} from '@leather.io/ui/native';

import { SendFormBaseContext, useSendFormContext } from '../send-form-context';

export function SendFormRecipient<T extends SendFormBaseContext<T>>() {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { formData } = useSendFormContext<T>();
  const { control } = useFormContext<z.infer<typeof formData.schema>>();
  const {
    field: { onChange, onBlur, value },
    fieldState: { error },
  } = useController({ name: 'recipient', control });
  const [isEditing, setIsEditing] = useState(false);
  const { watch } = useFormContext<z.infer<typeof formData.schema>>();

  const recipient = watch('recipient');
  const validRecipient = recipient && !error && !isEditing;
  return (
    <Pressable onPress={() => setIsEditing(true)}>
      <Box
        borderColor="ink.border-default"
        borderRadius="sm"
        borderWidth={1}
        height={64}
        justifyContent="center"
        p="4"
      >
        {validRecipient ? (
          <Flag img={<Avatar icon={<UserIcon />} />}>
            <AddressDisplayer address={value} />
          </Flag>
        ) : (
          <Box pt="6" gap="1" height={112} width="100%">
            <TextInput
              style={{
                borderWidth: 0,
                width: '100%',
              }}
              autoCapitalize="none"
              autoComplete="off"
              autoCorrect={false}
              autoFocus
              inputState="focused"
              onBlur={onBlur}
              onEndEditing={() => setIsEditing(false)}
              onChangeText={value => onChange(value)}
              placeholder={t({
                id: 'recipient-sheet.recipient.input.placeholder',
                message: 'Enter recipient',
              })}
              TextInputComponent={UIBottomSheetTextInput}
              textVariant="caption01"
              value={value}
            />
          </Box>
        )}
      </Box>
    </Pressable>
  );
}
