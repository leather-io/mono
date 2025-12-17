import type { StxBalance } from '@leather.io/models';
import type { AddressQuotedStxBalance } from '@leather.io/services';
import { StxAvatarIcon } from '@leather.io/ui';

import {
  useStxAccountBalance,
  useStxAddressBalance,
} from '@app/query/stacks/balance/stx-balance.hooks';

import { CryptoAssetItemError } from '../crypto-asset-item/crypto-asset-item-error';
import { CryptoAssetItemPlaceholder } from '../crypto-asset-item/crypto-asset-item-placeholder';

interface StxBalanceLoaderProps {
  address: string;
  children(
    balance: StxBalance,
    isLoading: boolean,
    isLoadingAdditionalData: boolean
  ): React.ReactNode;
}
export function StxBalanceLoader({ address, children }: StxBalanceLoaderProps) {
  const balance = useStxAddressBalance(address);
  if (!balance.data) return;
  return children(balance.data.stx, balance.isLoading, balance.isLoading);
}

interface StxAssetItemBalanceLoaderProps {
  accountIndex: number;
  children(
    balance: AddressQuotedStxBalance,
    isLoading: boolean,
    isLoadingAdditionalData: boolean
  ): React.ReactNode;
}
export function StxAssetItemBalanceLoader({
  accountIndex,
  children,
}: StxAssetItemBalanceLoaderProps) {
  const stxBalance = useStxAccountBalance(accountIndex);
  const isLoading = stxBalance.isLoading;
  if (isLoading) return <CryptoAssetItemPlaceholder />;
  if (stxBalance.isError || !stxBalance.data) {
    return <CryptoAssetItemError caption="STX" icon={<StxAvatarIcon />} title="Stacks" />;
  }

  return children(stxBalance.data, isLoading, false);
}
