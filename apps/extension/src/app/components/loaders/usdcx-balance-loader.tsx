import type { AccountId } from '@leather.io/models';
import type { Sip10Balance } from '@leather.io/services';
import { UsdcxAvatarIcon } from '@leather.io/ui';

import { useUsdcxAccountBalance } from '@app/query/stacks/sip10/sip10-balance.hooks';

import { CryptoAssetItemError } from '../crypto-asset-item/crypto-asset-item-error';
import { CryptoAssetItemPlaceholder } from '../crypto-asset-item/crypto-asset-item-placeholder';

interface UsdcxAssetItemBalanceLoaderProps {
  accountId: AccountId;
  children(balance: Sip10Balance, isLoading: boolean): React.ReactNode;
}

export function UsdcxAssetItemBalanceLoader({
  accountId,
  children,
}: UsdcxAssetItemBalanceLoaderProps) {
  const usdcxBalance = useUsdcxAccountBalance(accountId);

  const isLoading = usdcxBalance.state === 'loading';

  if (isLoading) return <CryptoAssetItemPlaceholder />;

  if (usdcxBalance.state === 'error') {
    return (
      <CryptoAssetItemError caption="USDCx" icon={<UsdcxAvatarIcon size="xl" />} title="USDCx" />
    );
  }

  return children(usdcxBalance.value, isLoading);
}
