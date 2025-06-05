import { useEffect } from 'react';

import { SheetLayout } from '@/components/sheets/sheet.layout';
import { GuardResult } from '@/features/send/components/recipient/use-recipient-evaluator';
import { t } from '@lingui/core/macro';

import { AddressDisplayer, Box, Button, SheetRef, Text } from '@leather.io/ui/native';

interface RecipientWarningSheetProps {
  sheetRef: SheetRef;
  config: GuardResult;
  onConfirm: (address: string) => void;
}

export function RecipientGuardSheet({ sheetRef, config, onConfirm }: RecipientWarningSheetProps) {
  useEffect(() => {
    if (config.severity !== 'none') {
      sheetRef.current?.present();
    }
  }, [sheetRef, config.severity]);

  if (config.severity === 'none') {
    return null;
  }

  const {
    title,
    address,
    description,
    primaryActionLabel = t`Confirm`,
    secondaryActionLabel = t`Cancel`,
    severity,
  } = config;

  function handleDismiss() {
    sheetRef.current?.dismiss();
  }

  return (
    <SheetLayout handleComponent={null} sheetRef={sheetRef} title={title}>
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
                <Button onPress={() => onConfirm(address)}>{primaryActionLabel}</Button>
                <Button variant="ghost" onPress={handleDismiss}>
                  {secondaryActionLabel}
                </Button>
              </>
            ),
            block: <Button onPress={handleDismiss}>{t`Dismiss`}</Button>,
          }[severity]
        }
      </Box>
    </SheetLayout>
  );
}
