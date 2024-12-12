import { useRef } from 'react';
import { useFormContext } from 'react-hook-form';

import { t } from '@lingui/macro';
import { z } from 'zod';

import {
  AddressDisplayer,
  Avatar,
  Box,
  Flag,
  Pressable,
  SheetRef,
  Text,
  UserIcon,
} from '@leather.io/ui/native';

import { SendFormBaseContext, useSendFormContext } from '../send-form-context';
import { RecipientSheet } from '../sheets/recipient-sheet';

export function SendFormRecipient<T extends SendFormBaseContext<T>>() {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { formData } = useSendFormContext<T>();
  const { watch } = useFormContext<z.infer<typeof formData.schema>>();
  const recipientSheetRef = useRef<SheetRef>(null);

  const recipient = watch('recipient');

  return (
    <>
      <Pressable onPress={() => recipientSheetRef.current?.present()}>
        <Box
          borderColor="ink.border-default"
          borderRadius="sm"
          borderWidth={1}
          height={64}
          justifyContent="center"
          p="4"
        >
          {recipient ? (
            <Flag
              img={
                <Avatar>
                  <UserIcon />
                </Avatar>
              }
            >
              <AddressDisplayer address={recipient} />
            </Flag>
          ) : (
            <Text color="ink.text-subdued" variant="label02">
              {t({
                id: 'send_form.recipient.input.label',
                message: 'Enter recipient',
              })}
            </Text>
          )}
        </Box>
      </Pressable>
      <RecipientSheet sheetRef={recipientSheetRef} />
    </>
  );
}
