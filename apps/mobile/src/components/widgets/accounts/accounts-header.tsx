import { AccountSelectorSheet } from '@/features/account-selector-sheet';
import { t } from '@lingui/macro';

import { ChevronRightIcon, SheetRef, Text, TouchableOpacity } from '@leather.io/ui/native';

interface AccountsHeaderProps {
  hasAccounts: boolean;
  sheetRef: React.RefObject<SheetRef>;
}

function AccountsHeaderText() {
  return <Text variant="heading05">{t`My accounts`}</Text>;
}

export function AccountsHeader({ hasAccounts, sheetRef }: AccountsHeaderProps) {
  if (!hasAccounts) return <AccountsHeaderText />;
  return (
    <>
      <TouchableOpacity
        onPress={() => sheetRef.current?.present()}
        flexDirection="row"
        gap="1"
        alignItems="center"
      >
        <AccountsHeaderText />
        <ChevronRightIcon variant="small" />
      </TouchableOpacity>

      <AccountSelectorSheet sheetRef={sheetRef} />
    </>
  );
}
