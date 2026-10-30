import { InputSheetLayout } from '@/components/sheets/input-sheet.layout';
import { OnboardingSelectors } from '@/shared/selectors/onboarding.selectors';
import { t } from '@lingui/core/macro';

import { type SheetRef } from '@leather.io/ui/native';

interface RecoverWalletSheetProps {
  recoverWalletSheetRef: SheetRef;
  passphrase: string;
  setPassphrase(passphrase: string): unknown;
}
export function RecoverWalletSheet({
  recoverWalletSheetRef,
  passphrase,
  setPassphrase,
}: RecoverWalletSheetProps) {
  return (
    <InputSheetLayout
      sheetRef={recoverWalletSheetRef}
      initialValue={passphrase}
      title={t`BIP39 passphrase`}
      placeholder={t`Passphrase`}
      submitTitle={t`Confirm`}
      inputTestId={OnboardingSelectors.RestoreWalletPassphraseInput}
      submitTestId={OnboardingSelectors.RestoreWalletPassphraseConfirm}
      onSubmit={newPassphrase => {
        recoverWalletSheetRef.current?.close();
        setPassphrase(newPassphrase);
      }}
    />
  );
}
