import { Text } from 'react-native';

import { useAccountsByFingerprint } from '@/store/accounts/accounts.read';
import { useKeyStore } from '@/store/key-store';
import { useBitcoinAccounts } from '@/store/keychains/bitcoin/bitcoin-keychains.read';
import { useStacksSigners } from '@/store/keychains/stacks/stacks-keychains.read';
import { useWallets } from '@/store/wallets/wallets.read';

import { AccountId, WalletId } from '@leather.io/models';

import { AccountLayout } from './account-list';
import { WalletListLayout } from './wallets';

type BitcoinAccountsProps = AccountId;

function BitcoinAccounts({ fingerprint, accountIndex }: BitcoinAccountsProps) {
  const accounts = useBitcoinAccounts().fromAccountIndex(fingerprint, accountIndex);

  return accounts.map(keychain => (
    <Text key={keychain.descriptor} style={{ marginLeft: 12, marginBottom: 8 }}>
      {keychain.derivePayer({ addressIndex: 0 }).address}
    </Text>
  ));
}

type StacksAccountsProps = AccountId;
function StacksAccounts({ fingerprint, accountIndex }: StacksAccountsProps) {
  const signers = useStacksSigners().fromAccountIndex(fingerprint, accountIndex);

  return signers.map(signer => (
    <Text key={signer.keyOrigin} style={{ marginLeft: 12, marginBottom: 8 }}>
      {signer.address}
    </Text>
  ));
}

type AccountsProps = WalletId;
function Accounts({ fingerprint }: AccountsProps) {
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
          <StacksAccounts fingerprint={fingerprint} accountIndex={accountIndex} />
          <BitcoinAccounts fingerprint={fingerprint} accountIndex={accountIndex} />
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
      renderAccount={fingerprint => <Accounts fingerprint={fingerprint} />}
      onRemoveWallet={fingerprint => wallets.remove(fingerprint)}
      onCreateNewAccount={fingerprint => keys.createNewAccountOfWallet(fingerprint)}
    />
  );
}
