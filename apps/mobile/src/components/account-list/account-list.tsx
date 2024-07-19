import { Pressable, Text, View } from 'react-native';

import { useKeyStore } from '@/state/key-store';
import { useBitcoinKeychains } from '@/state/keychains/bitcoin/bitcoin-keychains.slice';
import { useWallets } from '@/state/wallets/wallets.slice';
import groupBy from 'lodash.groupby';

import { extractAccountIndexFromDescriptor } from '@leather.io/crypto';

interface AccountsProps {
  fingerprint: string;
}
function Accounts({ fingerprint }: AccountsProps) {
  const keys = useKeyStore();
  const bitcoinAccounts = useBitcoinKeychains();
  const accounts = bitcoinAccounts.fromFingerprint(fingerprint);

  const grouped = Object.entries(
    groupBy(accounts, account => extractAccountIndexFromDescriptor(account.descriptor))
  );

  return grouped.map(([accountIndex, accounts]) => (
    <View key={accountIndex} style={{ marginBottom: 20 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <Text style={{ fontSize: 16, marginBottom: 8 }}>Account {accountIndex}</Text>
        <Pressable
          style={{ marginBottom: 12, marginLeft: 8 }}
          onPress={() => keys.removeAccount(fingerprint, Number(accountIndex))}
        >
          <Text>❌</Text>
        </Pressable>
      </View>
      {accounts.map(a => (
        <Text key={a.descriptor} style={{ marginLeft: 12, marginBottom: 8 }}>
          {a.address}
        </Text>
      ))}
    </View>
  ));
}

export function WalletList() {
  const wallets = useWallets();
  const keys = useKeyStore();
  return (
    <View style={{ padding: 20 }}>
      {wallets.list.map(wallet => (
        <View key={wallet.fingerprint}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text style={{ fontSize: 20, marginBottom: 12 }}>Wallet {wallet.fingerprint}</Text>
            <Pressable
              style={{ marginBottom: 12, marginLeft: 12 }}
              onPress={() => wallets.remove(wallet.fingerprint)}
            >
              <Text>❌</Text>
            </Pressable>
          </View>
          <Pressable
            style={{ marginBottom: 12 }}
            onPress={() => keys.createNewAccountOfWallet(wallet.fingerprint)}
          >
            <Text>Add new account for {wallet.fingerprint} 🆕</Text>
          </Pressable>
          <Accounts fingerprint={wallet.fingerprint} />
        </View>
      ))}
    </View>
  );
}
