import { ReactNode } from 'react';
import { Pressable, Text, View } from 'react-native';

import { Account } from '@/state/accounts/accounts';

interface AccountLayoutProps {
  fingerprint: string;
  account: Account;
  onRemoveAccount: (accountIndex: number) => void;
  renderKeychains(fingerprint: string, accountIndex: number): ReactNode;
}
export function AccountLayout({
  fingerprint,
  account,
  onRemoveAccount,
  renderKeychains,
}: AccountLayoutProps) {
  return (
    <View key={account.id} style={{ marginBottom: 20 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <Text style={{ fontSize: 16, marginBottom: 8 }}>Account {account.accountIndex}</Text>
        <Pressable
          style={{ marginBottom: 12, marginLeft: 8 }}
          onPress={() => onRemoveAccount(account.accountIndex)}
        >
          <Text>❌</Text>
        </Pressable>
      </View>
      {renderKeychains(fingerprint, account.accountIndex)}
    </View>
  );
}
