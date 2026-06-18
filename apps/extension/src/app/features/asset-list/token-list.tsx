import { Dispatch, SetStateAction } from 'react';

import { Stack } from 'leather-styles/jsx';

import {
  BitcoinFilledCircleIcon,
  BtcAvatarIcon,
  StacksFilledCircleIcon,
  StxAvatarIcon,
} from '@leather.io/ui';
import type { SerializedCryptoAssetId } from '@leather.io/utils';

import { BtcAssetItemBalanceLoader } from '@app/components/loaders/btc-balance-loader';
import { StxAssetItemBalanceLoader } from '@app/components/loaders/stx-balance-loader';
import { UsdcxAssetItemBalanceLoader } from '@app/components/loaders/usdcx-balance-loader';
import { StxCryptoAssetItem } from '@app/features/asset-list/stacks/stx-crypo-asset-item/stx-crypto-asset-item';
import { useCurrentAccountId } from '@app/store/accounts/account';
import { useCurrentAccountNativeSegwitPayer } from '@app/store/accounts/blockchain/bitcoin/native-segwit-account.hooks';
import { useCurrentStacksAccount } from '@app/store/accounts/blockchain/stacks/stacks-account.hooks';
import { useActiveWalletType } from '@app/store/common/wallet-type.selectors';
import { useIsPrivateMode } from '@app/store/settings/settings.selectors';

import { ConnectLedgerAssetItemFallback } from './_components/connect-ledger-asset-item-fallback';
import { BtcCryptoAssetItem } from './bitcoin/btc-crypto-asset-item/btc-crypto-asset-item';
import { Sip10TokenItem } from './stacks/sip10-token-list/sip10-token-item';
import { Sip10TokenAssetList } from './stacks/sip10-token-list/sip10-token-list';

export type TokenListVariant = 'interactive' | 'read-only';
export type AssetRightElementVariant = 'balance' | 'toggle';
export type AssetFilter = 'all' | 'enabled' | 'disabled';

interface TokenListProps {
  filter?: AssetFilter;
  variant?: TokenListVariant;
  assetRightElementVariant?: AssetRightElementVariant;
  showUnmanageableTokens?: boolean;
  onSelectAsset?(assetId: SerializedCryptoAssetId): void;
  setHasManageableTokens?: Dispatch<SetStateAction<boolean>>;
  showDepositButtons?: boolean;
}

export function TokenList({
  onSelectAsset,
  variant = 'read-only',
  assetRightElementVariant = 'balance',
  showUnmanageableTokens = true,
  showDepositButtons = false,
  setHasManageableTokens,
  filter,
}: TokenListProps) {
  const currentAccount = useCurrentAccountId();
  const currentStacksAccount = useCurrentStacksAccount();
  const currentBtcNativeSegwitAccount = useCurrentAccountNativeSegwitPayer();
  const isLedger = useActiveWalletType() === 'ledger';
  const isPrivate = useIsPrivateMode();

  return (
    <Stack>
      {showUnmanageableTokens &&
        (currentBtcNativeSegwitAccount ? (
          <BtcAssetItemBalanceLoader accountId={currentAccount}>
            {(balance, isLoading, isLoadingAdditionalData) => (
              <BtcCryptoAssetItem
                balance={balance}
                isLoading={isLoading}
                onSelectAsset={onSelectAsset}
                isLoadingAdditionalData={isLoadingAdditionalData}
                showDepositButtons={showDepositButtons}
              />
            )}
          </BtcAssetItemBalanceLoader>
        ) : (
          isLedger && (
            <ConnectLedgerAssetItemFallback
              chain="bitcoin"
              icon={
                <BtcAvatarIcon size="xl" indicator={<BitcoinFilledCircleIcon variant="small" />} />
              }
              symbol="BTC"
              variant={variant}
            />
          )
        ))}

      {showUnmanageableTokens &&
        (currentStacksAccount ? (
          <StxAssetItemBalanceLoader accountId={currentAccount}>
            {(balance, isLoading) => (
              <StxCryptoAssetItem
                balance={balance}
                isLoading={isLoading}
                isPrivate={isPrivate}
                onSelectAsset={onSelectAsset}
                showDepositButtons={showDepositButtons}
              />
            )}
          </StxAssetItemBalanceLoader>
        ) : (
          isLedger && (
            <ConnectLedgerAssetItemFallback
              chain="stacks"
              icon={
                <StxAvatarIcon size="xl" indicator={<StacksFilledCircleIcon variant="small" />} />
              }
              symbol="STX"
              variant={variant}
            />
          )
        ))}

      {showUnmanageableTokens && currentStacksAccount && (
        <UsdcxAssetItemBalanceLoader accountId={currentAccount}>
          {balance => (
            <Sip10TokenItem
              balance={balance}
              isEnabled={true}
              onSelectAsset={onSelectAsset}
              assetRightElementVariant={assetRightElementVariant}
            />
          )}
        </UsdcxAssetItemBalanceLoader>
      )}

      {currentStacksAccount && (
        <Sip10TokenAssetList
          accountId={currentAccount}
          assetFilter={filter}
          onSelectAsset={onSelectAsset}
          assetRightElementVariant={assetRightElementVariant}
          setHasManageableTokens={setHasManageableTokens}
        />
      )}
    </Stack>
  );
}
