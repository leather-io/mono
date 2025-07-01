import { ReactNode } from 'react';
import { Pressable, Text, View } from 'react-native';

import { WalletStore } from '@/store/wallets/utils';
import { t } from '@lingui/macro';

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
      {wallets.map(wallet => {
        const fingerprint = wallet.fingerprint;
        return (
          <View key={fingerprint}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={{ fontSize: 20, marginBottom: 12 }}>{t`Wallet ${fingerprint}`}</Text>
              <Pressable
                style={{ marginBottom: 12, marginLeft: 12 }}
                onPress={() => onRemoveWallet(fingerprint)}
              >
                <Text>❌</Text>
              </Pressable>
            </View>
            <Pressable
              style={{ marginBottom: 12 }}
              onPress={() => onCreateNewAccount(wallet.fingerprint)}
            >
              <Text>
                {t({
                  id: 'wallets.add-new-account',
                  message: `Add new account for ${fingerprint} 🆕`,
                })}
              </Text>
            </Pressable>
            {renderAccount(fingerprint)}
          </View>
        );
      })}
    </View>
  );
}
