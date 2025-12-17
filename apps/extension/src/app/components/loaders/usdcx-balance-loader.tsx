import type { Sip10Balance } from '@leather.io/services';

import { StacksAssetAvatar } from '@app/components/stacks-asset-avatar';
import { useUsdcxAccountBalance } from '@app/query/stacks/sip10/sip10-balance.hooks';

import { CryptoAssetItemError } from '../crypto-asset-item/crypto-asset-item-error';
import { CryptoAssetItemPlaceholder } from '../crypto-asset-item/crypto-asset-item-placeholder';

const USDCX_CONTRACT_ID_MAINNET = 'SP120SBRBQJ00MCWS7TM5R8WJNTTKD5K0HFRC2CNE.usdcx::usdcx-token';

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
      <CryptoAssetItemError
        caption="USDCx"
        icon={
          <StacksAssetAvatar color="white" gradientString={USDCX_CONTRACT_ID_MAINNET}>
            U
          </StacksAssetAvatar>
        }
        title="USDCx"
      />
    );
  }

  return children(usdcxBalance.value, isLoading);
}
