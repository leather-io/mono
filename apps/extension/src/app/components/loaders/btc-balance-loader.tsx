import type { AccountId } from '@leather.io/models';
import type { AccountQuotedBtcBalance } from '@leather.io/services';
import { BtcAvatarIcon } from '@leather.io/ui';

import { useBtcAccountBalance } from '@app/query/bitcoin/balance/btc-balance.hooks';

import { CryptoAssetItemError } from '../crypto-asset-item/crypto-asset-item-error';
import { CryptoAssetItemPlaceholder } from '../crypto-asset-item/crypto-asset-item-placeholder';

interface BtcAssetItemBalanceLoaderProps {
  accountId: AccountId;
  children(
    balance: AccountQuotedBtcBalance,
    isLoading: boolean,
    isLoadingAdditionalData: boolean
  ): React.ReactNode;
}
export function BtcAssetItemBalanceLoader({ accountId, children }: BtcAssetItemBalanceLoaderProps) {
  const balance = useBtcAccountBalance(accountId);
  const isLoading = balance.state === 'loading';
  if (isLoading) return <CryptoAssetItemPlaceholder />;
  if (balance.state === 'error') {
    return (
      <CryptoAssetItemError caption="BTC" icon={<BtcAvatarIcon size="xl" />} title="Bitcoin" />
    );
  }

  return children(balance.value, isLoading, false);
}
