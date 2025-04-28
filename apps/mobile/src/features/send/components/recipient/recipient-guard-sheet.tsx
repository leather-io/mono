import { RefObject } from 'react';

import { SheetLayout } from '@/components/sheets/sheet.layout';
import { GuardResult } from '@/features/send/components/recipient/use-recipient-evaluator';
import { t } from '@lingui/macro';

import {
  AddressDisplayer,
  Box,
  Button,
  PlusIcon,
  type SheetRef,
  Text,
} from '@leather.io/ui/native';

interface RecipientWarningSheetProps {
  sheetRef: RefObject<SheetRef>;
  config: GuardResult;
  onConfirm: (address: string) => void;
}

export function RecipientGuardSheet({ sheetRef, config, onConfirm }: RecipientWarningSheetProps) {
  if (config.severity === 'none') {
    return null;
  }

  const {
    title,
    address,
    description,
    primaryActionLabel = t({ id: 'send-form.guard.label_confirm', message: 'Confirm' }),
    secondaryActionLabel = t({ id: 'send-form.guard.label_cancel', message: 'Cancel' }),
    severity,
  } = config;

  function handleDismiss() {
    sheetRef.current?.dismiss();
  }

  return (
    <SheetLayout handleComponent={null} sheetRef={sheetRef} icon={<PlusIcon />} title={title}>
      <Text>{description}</Text>
      <Box
        p="5"
        mx="-5"
        my="2"
        borderTopWidth={1}
        borderBottomWidth={1}
        borderTopColor="ink.border-default"
        borderBottomColor="ink.border-default"
      >
        <AddressDisplayer address={address} />
      </Box>
      <Box gap="3">
        {
          {
            warn: (
              <>
                <Button title={primaryActionLabel} onPress={() => onConfirm(address)} />
                <Button buttonState="ghost" title={secondaryActionLabel} onPress={handleDismiss} />
              </>
            ),
            block: (
              <Button
                title={t({
                  id: 'send-form.guard.label_dismiss',
                  message: 'Dismiss',
                })}
                onPress={handleDismiss}
              />
            ),
          }[severity]
        }
      </Box>
    </SheetLayout>
  );
}
