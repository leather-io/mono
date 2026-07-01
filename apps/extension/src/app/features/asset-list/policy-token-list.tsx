import { useMemo } from 'react';

import { Stack } from 'leather-styles/jsx';

import type { SerializedCryptoAssetId } from '@leather.io/utils';

import { BtcAssetItemBalanceLoaderByAddresses } from '@app/components/loaders/btc-balance-loader';
import { StxAssetItemBalanceLoaderByAddresses } from '@app/components/loaders/stx-balance-loader';
import { Sip10TokenAssetListByAddresses } from '@app/features/asset-list/stacks/sip10-token-list/sip10-token-list-by-addresses';
import { StxCryptoAssetItem } from '@app/features/asset-list/stacks/stx-crypo-asset-item/stx-crypto-asset-item';
import { createPolicyAddresses } from '@app/store/policy/policy-addresses';
import { type PolicyStore } from '@app/store/policy/policy-store.utils';
import { useIsPrivateMode } from '@app/store/settings/settings.selectors';

import { BtcCryptoAssetItem } from './bitcoin/btc-crypto-asset-item/btc-crypto-asset-item';

interface PolicyTokenListProps {
  policy: PolicyStore;
  showDepositButtons?: boolean;
  onSelectAsset?(assetId: SerializedCryptoAssetId): void;
}

export function PolicyTokenList({
  policy,
  showDepositButtons,
  onSelectAsset,
}: PolicyTokenListProps) {
  const account = useMemo(() => createPolicyAddresses(policy), [policy]);
  const isPrivate = useIsPrivateMode();

  return (
    <Stack>
      {policy.chain === 'bitcoin' && (
        <BtcAssetItemBalanceLoaderByAddresses account={account}>
          {(balance, isLoading, isLoadingAdditionalData) => (
            <BtcCryptoAssetItem
              balance={balance}
              isLoading={isLoading}
              onSelectAsset={onSelectAsset}
              isLoadingAdditionalData={isLoadingAdditionalData}
              showDepositButtons={showDepositButtons}
            />
          )}
        </BtcAssetItemBalanceLoaderByAddresses>
      )}
      {policy.chain === 'stacks' && (
        <>
          <StxAssetItemBalanceLoaderByAddresses account={account}>
            {(balance, isLoading) => (
              <StxCryptoAssetItem
                balance={balance}
                isLoading={isLoading}
                isPrivate={isPrivate}
                onSelectAsset={onSelectAsset}
                showDepositButtons={showDepositButtons}
              />
            )}
          </StxAssetItemBalanceLoaderByAddresses>
          <Sip10TokenAssetListByAddresses account={account} onSelectAsset={onSelectAsset} />
        </>
      )}
    </Stack>
  );
}
