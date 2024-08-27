import { ReactNode } from 'react';
import { Pressable, Text, View } from 'react-native';

import { Account } from '@/state/accounts/accounts';
import { t } from '@lingui/macro';

interface AccountLayoutProps {
  fingerprint: string;
  account: Account;
  onHideAccount: (accountIndex: number) => void;
  renderKeychains(fingerprint: string, accountIndex: number): ReactNode;
}
export function AccountLayout({
  fingerprint,
  account,
  onHideAccount,
  renderKeychains,
}: AccountLayoutProps) {
  const { accountIndex } = account;
  return (
    <View key={account.id} style={{ marginBottom: 20 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <Text style={{ fontSize: 16, marginBottom: 8 }}>{t`Account ${accountIndex}`}</Text>
        <Pressable
          style={{ marginBottom: 12, marginLeft: 8 }}
          onPress={() => onHideAccount(accountIndex)}
        >
          <Text>❌</Text>
        </Pressable>
      </View>
      {renderKeychains(fingerprint, accountIndex)}
    </View>
  );
}
