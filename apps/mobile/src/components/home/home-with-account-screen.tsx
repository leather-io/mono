import { useRef, useState } from 'react';

import { FetchErrorCallout } from '@/components/error/fetch-error';
import { Screen } from '@/components/screen/screen';
import { useCurrentAccount } from '@/core/current-account-provider';
import { AccountDetails } from '@/features/account/account-details';
import { AccountSelectorSheet } from '@/features/account/account-selector/account-selector-sheet';
import { AvailableAccountBalance } from '@/features/account/components/available-account-balance';
import { AssetsList } from '@/features/balances/assets/assets-list';
import { BitcoinBalanceByAccount } from '@/features/balances/bitcoin/bitcoin-balance';
import { StacksBalanceByAccount } from '@/features/balances/stacks/stacks-balance';
import { CollectiblesList } from '@/features/collectibles/collectibles-list';
import { useTokenDetailsFlag } from '@/features/feature-flags';
import { NotificationsSheet } from '@/features/notifications/notifications-sheet';
import { useOnDetectNoNotificationPreference } from '@/features/notifications/use-notifications';
import { TokenDetailsProps } from '@/features/token/types';
import { useAccountBalance } from '@/queries/balance/account-balance.query';
import { useRunesAccountBalance } from '@/queries/balance/runes-balance.query';
import { useSip10AccountBalance } from '@/queries/balance/sip10-balance.query';
import { useAccountCollectibles } from '@/queries/collectibles/account-collectibles.query';
import { Account } from '@/store/accounts/accounts';
import { useRouter } from 'expo-router';

import { CryptoAssetProtocols } from '@leather.io/models';
import { SheetInstance } from '@leather.io/ui/native';

import { AccountScreenHeader } from './account-screen-header';
import { AssetTabs } from './components/asset-tabs';
import { ListTab } from './constants';

interface HomeScreenWithAccountProps {
  currentAccount: Account;
}

export function HomeScreenWithAccount({ currentAccount }: HomeScreenWithAccountProps) {
  const notificationSheetRef = useRef<SheetInstance>(null);
  const { fingerprint, accountIndex } = currentAccount;
  const { setCurrentAccount } = useCurrentAccount();
  const [listTab, setListTab] = useState<ListTab>('tokens');
  useOnDetectNoNotificationPreference(notificationSheetRef.current?.present);
  const accountSelectorSheetRef = useRef<SheetInstance>(null);

  const sip10Data = useSip10AccountBalance(fingerprint, accountIndex);
  const runesData = useRunesAccountBalance(fingerprint, accountIndex);
  const collectiblesData = useAccountCollectibles(fingerprint, accountIndex);
  function onOpenAccountSelector() {
    accountSelectorSheetRef.current?.present();
  }

  function onAccountPress(account: Account) {
    accountSelectorSheetRef.current?.close();
    setCurrentAccount(account);
  }
  const router = useRouter();
  function onOpenToken({ assetId, assetProtocol }: TokenDetailsProps) {
    router.navigate({
      pathname: '/(tabs)/(index)/[assetProtocol]/[assetId]',
      params: { assetId, assetProtocol },
    });
  }
  const tokenDetailsFlag = useTokenDetailsFlag();
  const onPressToken = tokenDetailsFlag ? onOpenToken : undefined;
  const { totalBalance } = useAccountBalance({
    fingerprint: currentAccount.fingerprint,
    accountIndex: currentAccount.accountIndex,
  });
  const isErrorTotalBalance = totalBalance.state === 'error';

  return (
    <Screen>
      <AccountScreenHeader account={currentAccount} onOpenAccountSelector={onOpenAccountSelector} />
      {isErrorTotalBalance && <FetchErrorCallout />}

      {listTab === 'tokens' && (
        <AssetsList
          header={
            <>
              {/* TODO: research better way of switching between flashlists */}
              <AccountDetails account={currentAccount} />
              <AssetTabs listTab={listTab} setListTab={setListTab} />
              <AvailableAccountBalance account={currentAccount} />
              <BitcoinBalanceByAccount
                fingerprint={fingerprint}
                accountIndex={accountIndex}
                onPress={() =>
                  onPressToken?.({ assetProtocol: CryptoAssetProtocols.nativeBtc, assetId: 'BTC' })
                }
              />
              <StacksBalanceByAccount
                fingerprint={fingerprint}
                accountIndex={accountIndex}
                onPress={() =>
                  onPressToken?.({ assetProtocol: CryptoAssetProtocols.nativeStx, assetId: 'STX' })
                }
              />
            </>
          }
          sip10Data={sip10Data}
          runesData={runesData}
          onPressToken={onPressToken}
        />
      )}
      {listTab === 'collectibles' && (
        <CollectiblesList
          header={
            <>
              <AccountDetails account={currentAccount} />
              <AssetTabs listTab={listTab} setListTab={setListTab} />
            </>
          }
          collectiblesData={collectiblesData}
        />
      )}

      <NotificationsSheet sheetRef={notificationSheetRef} />
      <AccountSelectorSheet sheetRef={accountSelectorSheetRef} onAccountPress={onAccountPress} />
    </Screen>
  );
}
