import { useRef, useState } from 'react';

import { FetchErrorCallout } from '@/components/error/fetch-error';
import { Screen } from '@/components/screen/screen';
import { AccountDetails } from '@/features/account/account-details';
import { AccountSelectorSheet } from '@/features/account/account-selector/account-selector-sheet';
import { AvailableAccountBalance } from '@/features/account/components/available-account-balance';
import { AssetsList } from '@/features/balances/assets/assets-list';
import { BitcoinBalanceByAccount } from '@/features/balances/bitcoin/bitcoin-balance';
import { ManageTokensSheet } from '@/features/balances/manage-tokens.sheet';
import { StacksBalanceByAccount } from '@/features/balances/stacks/stacks-balance';
import { useCollectibleDetailsFlag, useTokenDetailsFlag } from '@/features/feature-flags';
import { NotificationsSheet } from '@/features/notifications/notifications-sheet';
import { useOnDetectNoNotificationPreference } from '@/features/notifications/use-notifications';
import { CollectiblesList } from '@/features/token/collectibles-list';
import { TokenDetailsProps } from '@/features/token/types';
import { useAccountTotalBalance } from '@/queries/balance/account-balance.query';
import { useRunesAccountBalance } from '@/queries/balance/runes-balance.query';
import { useSip10AccountBalance } from '@/queries/balance/sip10-balance.query';
import { useSettings } from '@/store/settings/settings';
import { useAccountScaledBalanceAnalytics } from '@/utils/analytics-hooks';
import { useRouter } from 'expo-router';

import { btcAsset, stxAsset } from '@leather.io/constants';
import { AccountId } from '@leather.io/models';
import { SheetInstance } from '@leather.io/ui/native';
import { getAssetId, serializeAssetId } from '@leather.io/utils';

import { AccountScreenHeader } from './account-screen-header';
import { AssetTabs } from './components/asset-tabs';
import { ListTab } from './constants';

interface HomeScreenWithAccountProps {
  currentAccount: AccountId;
}
export function HomeScreenWithAccount({ currentAccount }: HomeScreenWithAccountProps) {
  const notificationSheetRef = useRef<SheetInstance>(null);
  const manageTokensSheetRef = useRef<SheetInstance>(null);
  const { fingerprint, accountIndex } = currentAccount;
  const { changeCurrentAccount } = useSettings();
  const [listTab, setListTab] = useState<ListTab>('tokens');
  useOnDetectNoNotificationPreference(notificationSheetRef.current?.present);
  useAccountScaledBalanceAnalytics({ currentAccount });
  const accountSelectorSheetRef = useRef<SheetInstance>(null);
  const sip10Data = useSip10AccountBalance(fingerprint, accountIndex);
  const runesData = useRunesAccountBalance(fingerprint, accountIndex);
  const allSip10Data = useSip10AccountBalance(fingerprint, accountIndex, {
    includeHiddenAssets: true,
  });
  const allRunesData = useRunesAccountBalance(fingerprint, accountIndex, {
    includeHiddenAssets: true,
  });
  const hasAssets = !!allSip10Data.value?.sip10s.length || !!allRunesData.value?.runes.length;

  function onOpenAccountSelector() {
    accountSelectorSheetRef.current?.present();
  }

  function onAccountPress(account: AccountId) {
    accountSelectorSheetRef.current?.close();
    changeCurrentAccount(account);
  }

  const router = useRouter();

  function onOpenToken({ assetId }: TokenDetailsProps) {
    router.navigate({
      pathname: '/(tabs)/(index)/[assetId]',
      params: { assetId },
    });
  }
  const tokenDetailsFlag = useTokenDetailsFlag();
  const collectiblesDetailsFlag = useCollectibleDetailsFlag();
  const totalBalance = useAccountTotalBalance({
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
              <AvailableAccountBalance
                account={currentAccount}
                onOpenManageTokens={() => {
                  manageTokensSheetRef.current?.present();
                }}
                hasAssets={hasAssets}
              />
              <BitcoinBalanceByAccount
                fingerprint={fingerprint}
                accountIndex={accountIndex}
                onPress={
                  tokenDetailsFlag
                    ? () =>
                        onOpenToken?.({
                          assetId: serializeAssetId(getAssetId(btcAsset)),
                        })
                    : undefined
                }
              />
              <StacksBalanceByAccount
                fingerprint={fingerprint}
                accountIndex={accountIndex}
                onPress={
                  tokenDetailsFlag
                    ? () =>
                        onOpenToken?.({
                          assetId: serializeAssetId(getAssetId(stxAsset)),
                        })
                    : undefined
                }
              />
            </>
          }
          sip10Data={sip10Data}
          runesData={runesData}
          onPressToken={tokenDetailsFlag ? onOpenToken : undefined}
        />
      )}
      {listTab === 'collectibles' && (
        <CollectiblesList
          currentAccount={currentAccount}
          header={
            <>
              <AccountDetails account={currentAccount} />
              <AssetTabs listTab={listTab} setListTab={setListTab} />
            </>
          }
          onPressToken={collectiblesDetailsFlag ? onOpenToken : undefined}
        />
      )}

      <NotificationsSheet sheetRef={notificationSheetRef} />
      <AccountSelectorSheet sheetRef={accountSelectorSheetRef} onAccountPress={onAccountPress} />
      <ManageTokensSheet sheetRef={manageTokensSheetRef} currentAccount={currentAccount} />
    </Screen>
  );
}
