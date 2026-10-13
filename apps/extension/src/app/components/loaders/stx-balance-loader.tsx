import type { AccountAddresses, AccountId, StxBalance } from '@leather.io/models';
import type { AddressQuotedStxBalance } from '@leather.io/services';
import { StxAvatarIcon } from '@leather.io/ui';

import {
  useStxAccountBalance,
  useStxAccountBalanceByAddresses,
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
  if (!balance.value) return;
  return children(balance.value.stx, balance.state !== 'success', balance.state !== 'success');
}

interface StxAssetItemBalanceLoaderProps {
  accountId: AccountId;
  children(
    balance: AddressQuotedStxBalance,
    isLoading: boolean,
    isLoadingAdditionalData: boolean
  ): React.ReactNode;
}
function renderStxBalance(
  stxBalance: ReturnType<typeof useStxAccountBalance>,
  children: StxAssetItemBalanceLoaderProps['children']
) {
  const isLoading = stxBalance.state === 'loading';
  if (isLoading) return <CryptoAssetItemPlaceholder />;
  if (stxBalance.state === 'error') {
    return <CryptoAssetItemError caption="STX" icon={<StxAvatarIcon size="xl" />} title="Stacks" />;
  }

  return children(stxBalance.value, isLoading, false);
}

export function StxAssetItemBalanceLoader({ accountId, children }: StxAssetItemBalanceLoaderProps) {
  return renderStxBalance(useStxAccountBalance(accountId), children);
}

interface StxAssetItemBalanceLoaderByAddressesProps {
  account: AccountAddresses;
  children(
    balance: AddressQuotedStxBalance,
    isLoading: boolean,
    isLoadingAdditionalData: boolean
  ): React.ReactNode;
}
export function StxAssetItemBalanceLoaderByAddresses({
  account,
  children,
}: StxAssetItemBalanceLoaderByAddressesProps) {
  return renderStxBalance(useStxAccountBalanceByAddresses(account), children);
}
