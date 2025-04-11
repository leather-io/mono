import { ScrollView } from 'react-native';

import { Balance } from '@/components/balance/balance';
import { FullHeightSheetHeader } from '@/components/full-height-sheet/full-height-sheet-header';
import { FullHeightSheetLayout } from '@/components/full-height-sheet/full-height-sheet.layout';
import { HeaderBackButton } from '@/components/headers/components/header-back-button';
import { AccountListItem } from '@/features/accounts/account-list/account-list-item';
import { AccountAddress } from '@/features/accounts/components/account-address';
import { AccountAvatar } from '@/features/accounts/components/account-avatar';
import { useSendNavigation, useSendRoute } from '@/features/send/navigation';
import { useSendFlowContext } from '@/features/send/send-flow-provider';
import { SendableAsset } from '@/features/send/types';
import { NetworkBadge } from '@/features/settings/network-badge';
import { useAccountBalance } from '@/queries/balance/account-balance.query';
import { type Account } from '@/store/accounts/accounts';
import { useWalletByFingerprint } from '@/store/wallets/wallets.read';
import { t } from '@lingui/macro';

export function SelectAccount() {
  const { navigate } = useSendNavigation();
  const route = useSendRoute<'select-account'>();
  const canGoBack = route.params?.previousRoute === 'select-asset';

  const {
    state: { accounts, selectedAsset },
    selectAccount,
  } = useSendFlowContext();

  function handleSelectAccount(account: Account) {
    selectAccount(account);
    navigate(selectedAsset ? 'form' : 'select-asset', { previousRoute: 'select-account' });
  }

  function handleBackButtonPress() {
    navigate('select-asset');
    selectAccount(null);
  }

  return (
    <FullHeightSheetLayout
      header={
        <FullHeightSheetHeader
          title={t({
            id: 'select_account.header_title',
            message: 'Select account',
          })}
          subtitle={t({
            id: 'select_account.send.header_subtitle',
            message: 'Send',
          })}
          leftElement={canGoBack ? <HeaderBackButton onPress={handleBackButtonPress} /> : null}
          rightElement={<NetworkBadge />}
        />
      }
    >
      <ScrollView>
        {accounts.map(account => {
          return (
            <AccountItem
              key={account.id}
              account={account}
              onSelectAccount={handleSelectAccount}
              asset={selectedAsset!}
            />
          );
        })}
      </ScrollView>
    </FullHeightSheetLayout>
  );
}

interface AccountItemProps {
  account: Account;
  onSelectAccount: (account: Account) => void;
  asset: SendableAsset;
}

function AccountItem({ account, asset, onSelectAccount }: AccountItemProps) {
  const wallet = useWalletByFingerprint(account.fingerprint);
  const balance = useAccountBalance({
    accountIndex: account.accountIndex,
    fingerprint: account.fingerprint,
  })[asset];

  // TODO LEA-1726: handle balance loading & error states
  if (balance.state !== 'success') {
    return null;
  }

  if (balance.state === 'success' && balance.value.fiat.availableBalance.amount.isZero()) {
    return null;
  }

  return (
    <AccountListItem
      onPress={() => onSelectAccount(account)}
      accountName={account.name}
      walletName={wallet?.name}
      address={
        <AccountAddress accountIndex={account.accountIndex} fingerprint={account.fingerprint} />
      }
      balance={<Balance balance={balance.value.fiat.availableBalance} />}
      icon={<AccountAvatar icon={account.icon} />}
    />
  );
}
