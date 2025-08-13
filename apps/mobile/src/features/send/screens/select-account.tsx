import { ScrollView } from 'react-native';

import { Balance } from '@/components/balance/balance';
import { HeaderBackButton } from '@/components/screen/screen-header/components/header-back-button';
import { FullHeightSheetHeader } from '@/components/sheets/full-height-sheet/full-height-sheet-header';
import { FullHeightSheetLayout } from '@/components/sheets/full-height-sheet/full-height-sheet.layout';
import { AccountListItem } from '@/features/account/account-list/account-list-item';
import { AccountAddress } from '@/features/account/components/account-address';
import { AccountAvatar } from '@/features/account/components/account-avatar';
import { useSendNavigation, useSendRoute } from '@/features/send/navigation';
import { useSendFlowContext } from '@/features/send/send-flow-provider';
import { useAccountBalance } from '@/queries/balance/account-balance.query';
import { type Account } from '@/store/accounts/accounts';
import { useWalletByFingerprint } from '@/store/wallets/wallets.read';
import { analytics } from '@/utils/analytics';
import { t } from '@lingui/core/macro';

import { FungibleCryptoAsset } from '@leather.io/models';

export function SelectAccount() {
  const { navigate } = useSendNavigation();
  const route = useSendRoute<'select-account'>();
  const canGoBack = route.params?.previousRoute === 'select-asset';

  const {
    state: { accounts, selectedAsset },
    selectAccount,
  } = useSendFlowContext();

  function handleSelectAccount(account: Account) {
    analytics.track('send_account_selected');
    selectAccount(account);
    navigate(selectedAsset ? 'form' : 'select-asset', { previousRoute: 'select-account' });
  }

  function handleBackButtonPress() {
    analytics.track('send_back_button_pressed', { screen: 'select-asset' });
    navigate('select-asset');
    selectAccount(null);
  }

  return (
    <FullHeightSheetLayout
      header={
        <FullHeightSheetHeader
          title={t`Select account`}
          subtitle={t`Send`}
          leftElement={canGoBack ? <HeaderBackButton onPress={handleBackButtonPress} /> : null}
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
  asset: FungibleCryptoAsset;
}

function AccountItem({ account, asset, onSelectAccount }: AccountItemProps) {
  const wallet = useWalletByFingerprint(account.fingerprint);
  const { btc, stx, sip10 } = useAccountBalance({
    accountIndex: account.accountIndex,
    fingerprint: account.fingerprint,
  });

  if (btc.state !== 'success' || stx.state !== 'success' || sip10.state !== 'success') {
    return null;
  }
  function getAvailableBalance() {
    switch (asset.protocol) {
      case 'nativeStx':
        if (stx.state !== 'success') return;
        return stx.value.quote.availableUnlockedBalance;
      case 'nativeBtc':
        if (btc.state !== 'success') return;
        return btc.value.quote.availableBalance;
      case 'sip10': {
        if (sip10.state !== 'success') return;

        const token = sip10.value.sip10s.find(
          sip10 => asset.protocol === 'sip10' && sip10.asset.assetId === asset.assetId
        );
        return token?.quote.availableBalance;
      }
      default:
        return;
    }
  }

  return (
    <AccountListItem
      onPress={() => onSelectAccount(account)}
      accountName={account.name}
      walletName={wallet?.name}
      address={
        <AccountAddress accountIndex={account.accountIndex} fingerprint={account.fingerprint} />
      }
      balance={<Balance balance={getAvailableBalance()} />}
      icon={<AccountAvatar icon={account.icon} />}
    />
  );
}
