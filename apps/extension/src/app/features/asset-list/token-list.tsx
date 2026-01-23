import { Dispatch, SetStateAction } from 'react';

import { Stack } from 'leather-styles/jsx';

import {
  BitcoinFilledCircleIcon,
  BtcAvatarIcon,
  StacksFilledCircleIcon,
  StxAvatarIcon,
} from '@leather.io/ui';

import { Brc20TokensLoader } from '@app/components/loaders/brc20-tokens-loader';
import { BtcAssetItemBalanceLoader } from '@app/components/loaders/btc-balance-loader';
import { Src20TokensLoader } from '@app/components/loaders/src20-tokens-loader';
import { StxAssetItemBalanceLoader } from '@app/components/loaders/stx-balance-loader';
import { UsdcxAssetItemBalanceLoader } from '@app/components/loaders/usdcx-balance-loader';
import { Brc20TokenList } from '@app/features/asset-list/bitcoin/brc20-token-list/brc20-token-list';
import { RunesAssetList } from '@app/features/asset-list/bitcoin/runes-asset-list/runes-asset-list';
import { Src20TokenList } from '@app/features/asset-list/bitcoin/src20-token-list/src20-token-list';
import { StxCryptoAssetItem } from '@app/features/asset-list/stacks/stx-crypo-asset-item/stx-crypto-asset-item';
import { useCurrentAccountId } from '@app/store/accounts/account';
import { useCurrentAccountNativeSegwitSigner } from '@app/store/accounts/blockchain/bitcoin/native-segwit-account.hooks';
import { useCurrentAccountTaprootSigner } from '@app/store/accounts/blockchain/bitcoin/taproot-account.hooks';
import { useCurrentStacksAccount } from '@app/store/accounts/blockchain/stacks/stacks-account.hooks';
import { useHasLedgerKeys } from '@app/store/ledger/ledger.selectors';
import { useIsPrivateMode } from '@app/store/settings/settings.selectors';

import type { AssetFilter } from '../../common/hooks/use-manage-tokens';
import { ConnectLedgerAssetItemFallback } from './_components/connect-ledger-asset-item-fallback';
import { BtcCryptoAssetItem } from './bitcoin/btc-crypto-asset-item/btc-crypto-asset-item';
import { Sip10TokenItem } from './stacks/sip10-token-list/sip10-token-item';
import { Sip10TokenAssetList } from './stacks/sip10-token-list/sip10-token-list';

export type TokenListVariant = 'interactive' | 'read-only';
export type AssetRightElementVariant = 'balance' | 'toggle';

interface TokenListProps {
  filter?: AssetFilter;
  variant?: TokenListVariant;
  assetRightElementVariant?: AssetRightElementVariant;
  showUnmanageableTokens?: boolean;
  onSelectAsset?(symbol: string, contractId?: string): void;
  setHasManageableTokens?: Dispatch<SetStateAction<boolean>>;
}

export function TokenList({
  onSelectAsset,
  variant = 'read-only',
  assetRightElementVariant = 'balance',
  showUnmanageableTokens = true,
  setHasManageableTokens,
  filter,
}: TokenListProps) {
  const currentAccount = useCurrentAccountId();
  const currentStacksAccount = useCurrentStacksAccount();
  const currentBtcNativeSegwitAccount = useCurrentAccountNativeSegwitSigner();
  const currentBtcTaprootAccount = useCurrentAccountTaprootSigner();
  const isLedger = useHasLedgerKeys();
  const isPrivate = useIsPrivateMode();

  const isReadOnly = variant === 'read-only';

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

      {currentBtcTaprootAccount && currentBtcNativeSegwitAccount && isReadOnly && (
        <>
          <Brc20TokensLoader filter={filter}>
            {({ tokens, preEnabledTokensIds }) => (
              <Brc20TokenList
                tokens={tokens}
                variant={variant}
                assetRightElementVariant={assetRightElementVariant}
                preEnabledTokensIds={preEnabledTokensIds}
                setHasManageableTokens={setHasManageableTokens}
              />
            )}
          </Brc20TokensLoader>
          <Src20TokensLoader
            filter={filter}
            address={currentBtcNativeSegwitAccount({ changeIndex: 0, addressIndex: 0 }).address}
          >
            {({ tokens, preEnabledTokensIds }) => (
              <Src20TokenList
                tokens={tokens}
                assetRightElementVariant={assetRightElementVariant}
                preEnabledTokensIds={preEnabledTokensIds}
                setHasManageableTokens={setHasManageableTokens}
              />
            )}
          </Src20TokensLoader>
          <RunesAssetList
            accountId={currentAccount}
            filter={filter}
            assetRightElementVariant={assetRightElementVariant}
            setHasManageableTokens={setHasManageableTokens}
          />
        </>
      )}
    </Stack>
  );
}
