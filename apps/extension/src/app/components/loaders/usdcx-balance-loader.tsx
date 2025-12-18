import type { Sip10Balance } from '@leather.io/services';
import { UsdcxAvatarIcon } from '@leather.io/ui';

import { useUsdcxAccountBalance } from '@app/query/stacks/sip10/sip10-balance.hooks';

import { CryptoAssetItemError } from '../crypto-asset-item/crypto-asset-item-error';
import { CryptoAssetItemPlaceholder } from '../crypto-asset-item/crypto-asset-item-placeholder';

interface UsdcxAssetItemBalanceLoaderProps {
  accountIndex: number;
  children(balance: Sip10Balance, isLoading: boolean): React.ReactNode;
}

export function UsdcxAssetItemBalanceLoader({
  accountIndex,
  children,
}: UsdcxAssetItemBalanceLoaderProps) {
  const usdcxBalance = useUsdcxAccountBalance(accountIndex);

  const isLoading = usdcxBalance.state === 'loading';

  if (isLoading) return <CryptoAssetItemPlaceholder />;

  if (usdcxBalance.state === 'error') {
    return (
      <CryptoAssetItemError caption="USDCx" icon={<UsdcxAvatarIcon size="xl" />} title="USDCx" />
    );
  }

  return children(usdcxBalance.value, isLoading);
}
