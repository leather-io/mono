import type { AccountAddresses, AccountId } from '@leather.io/models';
import type { AccountQuotedBtcBalance } from '@leather.io/services';
import { BtcAvatarIcon } from '@leather.io/ui';

import {
  useBtcAccountBalance,
  useBtcAccountBalanceByAddresses,
} from '@app/query/bitcoin/balance/btc-balance.hooks';

import { CryptoAssetItemError } from '../crypto-asset-item/crypto-asset-item-error';
import { CryptoAssetItemPlaceholder } from '../crypto-asset-item/crypto-asset-item-placeholder';

interface BtcAssetItemBalanceLoaderChildren {
  children(
    balance: AccountQuotedBtcBalance,
    isLoading: boolean,
    isLoadingAdditionalData: boolean
  ): React.ReactNode;
}

function renderBtcBalance(
  balance: ReturnType<typeof useBtcAccountBalance>,
  children: BtcAssetItemBalanceLoaderChildren['children']
) {
  const isLoading = balance.state === 'loading';
  if (isLoading) return <CryptoAssetItemPlaceholder />;
  if (balance.state === 'error') {
    return (
      <CryptoAssetItemError caption="BTC" icon={<BtcAvatarIcon size="xl" />} title="Bitcoin" />
    );
  }
  return children(balance.value, isLoading, false);
}

interface BtcAssetItemBalanceLoaderProps extends BtcAssetItemBalanceLoaderChildren {
  accountId: AccountId;
}
export function BtcAssetItemBalanceLoader({ accountId, children }: BtcAssetItemBalanceLoaderProps) {
  return renderBtcBalance(useBtcAccountBalance(accountId), children);
}

interface BtcAssetItemBalanceLoaderByAddressesProps extends BtcAssetItemBalanceLoaderChildren {
  account: AccountAddresses;
}
export function BtcAssetItemBalanceLoaderByAddresses({
  account,
  children,
}: BtcAssetItemBalanceLoaderByAddressesProps) {
  return renderBtcBalance(useBtcAccountBalanceByAddresses(account), children);
}
