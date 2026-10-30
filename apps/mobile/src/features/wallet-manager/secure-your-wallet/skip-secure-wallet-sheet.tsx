import { WarningSheetLayout } from '@/components/sheets/warning-sheet.layout';
import { OnboardingSelectors } from '@/shared/selectors/onboarding.selectors';
import { t } from '@lingui/core/macro';

import { type SheetRef } from '@leather.io/ui/native';

interface SkipSecureWalletSheetProps {
  sheetRef: SheetRef;
  onSubmit(): void;
}
export function SkipSecureWalletSheet({ sheetRef, onSubmit }: SkipSecureWalletSheetProps) {
  return (
    <WarningSheetLayout
      variant="critical"
      sheetRef={sheetRef}
      title={t`Continue without security`}
      description={t`Proceed with caution since your wallet will not be protected by your device’s native security mechanism.`}
      onSubmit={onSubmit}
      submitTestId={OnboardingSelectors.SkipSecureWalletContinueButton}
      cancelTestId={OnboardingSelectors.SkipSecureWalletCancelButton}
    />
  );
}
