import React from 'react';

import { AccountSelectorSheet } from '@/features/account-selector-sheet';
import { t } from '@lingui/macro';

import { ChevronRightIcon, SheetRef, Text, TouchableOpacity } from '@leather.io/ui/native';

interface AccountHeaderProps {
  hasAccounts: boolean;
  sheetRef: React.RefObject<SheetRef>;
}

function AccountHeaderText() {
  return <Text variant="heading05">{t`My accounts`}</Text>;
}

export function AccountHeader({ hasAccounts, sheetRef }: AccountHeaderProps) {
  if (!hasAccounts) return <AccountHeaderText />;
  return (
    <>
      <TouchableOpacity
        onPress={() => sheetRef.current?.present()}
        flexDirection="row"
        gap="1"
        alignItems="center"
      >
        <AccountHeaderText />
        <ChevronRightIcon variant="small" />
      </TouchableOpacity>

      <AccountSelectorSheet sheetRef={sheetRef} />
    </>
  );
}
