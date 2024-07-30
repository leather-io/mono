import { ReactNode } from 'react';
import { Pressable, Text, View } from 'react-native';

import { WalletStore } from '@/state/wallets/wallets.slice';

interface WalletListLayoutProps {
  wallets: WalletStore[];
  onRemoveWallet: (fingerprint: string) => void;
  onCreateNewAccount: (fingerprint: string) => void;
  renderAccount(fingerprint: string): ReactNode;
}
export function WalletListLayout({
  wallets,
  onRemoveWallet,
  onCreateNewAccount,
  renderAccount,
}: WalletListLayoutProps) {
  return (
    <View style={{ padding: 20 }}>
      {wallets.map(wallet => (
        <View key={wallet.fingerprint}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text style={{ fontSize: 20, marginBottom: 12 }}>Wallet {wallet.fingerprint}</Text>
            <Pressable
              style={{ marginBottom: 12, marginLeft: 12 }}
              onPress={() => onRemoveWallet(wallet.fingerprint)}
            >
              <Text>❌</Text>
            </Pressable>
          </View>
          <Pressable
            style={{ marginBottom: 12 }}
            onPress={() => onCreateNewAccount(wallet.fingerprint)}
          >
            <Text>Add new account for {wallet.fingerprint} 🆕</Text>
          </Pressable>
          {renderAccount(wallet.fingerprint)}
        </View>
      ))}
    </View>
  );
}
