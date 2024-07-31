import { Text } from 'react-native';

import { useAccounts } from '@/state/accounts/accounts.slice';
import { useKeyStore } from '@/state/key-store';
import { useBitcoinKeychains } from '@/state/keychains/bitcoin/bitcoin-keychains.slice';
import { useStacksKeychains } from '@/state/keychains/stacks/stacks-keychains.slice';
import { useWallets } from '@/state/wallets/wallets.slice';

import { AccountLayout } from './account-list';
import { WalletListLayout } from './wallets';

interface BitcoinKeychainProps {
  fingerprint: string;
  accountIndex: number;
}
function BitcoinKeychains({ fingerprint, accountIndex }: BitcoinKeychainProps) {
  const bitcoinKeychains = useBitcoinKeychains();
  const keychains = bitcoinKeychains.fromAccountIndex(fingerprint, accountIndex);
  return keychains.map(keychain => (
    <Text key={keychain.descriptor} style={{ marginLeft: 12, marginBottom: 8 }}>
      {keychain.address}
    </Text>
  ));
}
interface StacksKeychainProps {
  fingerprint: string;
  accountIndex: number;
}
function StacksKeychains({ fingerprint, accountIndex }: StacksKeychainProps) {
  const stacksKeychains = useStacksKeychains();
  const keychains = stacksKeychains.fromAccountIndex(fingerprint, accountIndex);

  return keychains.map(keychain => (
    <Text key={keychain.keyOrigin} style={{ marginLeft: 12, marginBottom: 8 }}>
      {keychain.address}
    </Text>
  ));
}

interface AccountsProps {
  fingerprint: string;
}
export function Accounts({ fingerprint }: AccountsProps) {
  const keys = useKeyStore();
  const accounts = useAccounts(fingerprint);

  return accounts.list.map(account => (
    <AccountLayout
      key={account.id}
      fingerprint={fingerprint}
      account={account}
      onRemoveAccount={index => keys.removeAccount(fingerprint, index)}
      renderKeychains={(fingerprint, accountIndex) => (
        <>
          <StacksKeychains fingerprint={fingerprint} accountIndex={accountIndex} />
          <BitcoinKeychains fingerprint={fingerprint} accountIndex={accountIndex} />
        </>
      )}
    />
  ));
}

export function WalletList() {
  const wallets = useWallets();
  const keys = useKeyStore();

  return (
    <WalletListLayout
      wallets={wallets.list}
      onRemoveWallet={fingerprint => wallets.remove(fingerprint)}
      onCreateNewAccount={fingerprint => keys.createNewAccountOfWallet(fingerprint)}
      renderAccount={fingerprint => <Accounts fingerprint={fingerprint} />}
    />
  );
}
