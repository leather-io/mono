import { useState } from 'react';

import { t } from '@lingui/core/macro';

import { Box, Button, Sheet, SheetNativeBackdrop, SheetRef, Text } from '@leather.io/ui/native';

import { BulletPoint } from './bullet-point';
import { SwitchCheck } from './switch-check';

interface AllowModeWarningSheetProps {
  ref: SheetRef;
  onDismiss(): void;
}
export function AllowModeWarningSheet({ ref, onDismiss: _onDismiss }: AllowModeWarningSheetProps) {
  const [hasAgreedToRisks, setHasAgreedToRisks] = useState(false);

  function onProceed() {
    ref.current?.dismiss();
  }
  function onDismiss() {
    ref.current?.dismiss();
    _onDismiss();
  }

  return (
    <Sheet
      ref={ref}
      enablePanDownToClose={false}
      backdropComponent={props => <SheetNativeBackdrop pressBehavior="none" {...props} />}
    >
      <Sheet.View justifyContent="space-between" gap="5">
        <Sheet.Header
          leftElement={
            <Sheet.Title>{t`Careful. This transaction could drain your wallet.`}</Sheet.Title>
          }
        />
        <Box px="5" gap="4">
          <Text>{t`By signing, this app can move your assets anytime.`}</Text>
          <Box>
            <BulletPoint title={t`No confirmations will appear.`} />
            <BulletPoint title={t`If unsafe, your wallet could be drained.`} />
          </Box>

          <SwitchCheck
            value={hasAgreedToRisks}
            onValueChange={setHasAgreedToRisks}
            title={t`I’m aware of the risks`}
          />

          <Box gap="3">
            <Button disabled={!hasAgreedToRisks} onPress={onProceed}>
              {t`Proceed to transaction`}
            </Button>
            <Button onPress={onDismiss} variant="ghost">
              {t`Do not proceed`}
            </Button>
          </Box>
        </Box>
      </Sheet.View>
    </Sheet>
  );
}
