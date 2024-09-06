import { Text } from 'react-native';

import { useAccountsByFingerprint } from '@/store/accounts/accounts.read';
import { useKeyStore } from '@/store/key-store';
import { useBitcoinKeychains } from '@/store/keychains/bitcoin/bitcoin-keychains.read';
import { useStacksKeychains } from '@/store/keychains/stacks/stacks-keychains.read';
import { useWallets } from '@/store/wallets/wallets.read';

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
  const accounts = useAccountsByFingerprint(fingerprint);

  return accounts.list.map(account => (
    <AccountLayout
      key={account.id}
      fingerprint={fingerprint}
      account={account}
      onHideAccount={index => keys.hideAccount(fingerprint, index)}
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
