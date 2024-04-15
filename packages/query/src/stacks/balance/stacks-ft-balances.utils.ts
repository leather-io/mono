import { FtMetadataResponse } from '@hirosystems/token-metadata-api-client';
import { STX_DECIMALS } from '@leather-wallet/constants';
import {
  Money,
  StacksCryptoCurrencyAssetBalance,
  StacksFungibleTokenAssetBalance,
} from '@leather-wallet/models';
import { createMoney, isTransferableStacksFungibleTokenAsset } from '@leather-wallet/utils';
import BigNumber from 'bignumber.js';

export function createStacksCryptoCurrencyAssetTypeWrapper(
  balance: BigNumber
): StacksCryptoCurrencyAssetBalance {
  return {
    blockchain: 'stacks',
    type: 'crypto-currency',
    balance: createMoney(balance, 'STX'),
    asset: {
      decimals: STX_DECIMALS,
      hasMemo: true,
      name: 'Stacks',
      symbol: 'STX',
    },
  };
}

export function addQueriedMetadataToInitializedStacksFungibleTokenAssetBalance(
  assetBalance: StacksFungibleTokenAssetBalance,
  metadata: FtMetadataResponse,
  price: Money | null
) {
  return {
    ...assetBalance,
    balance: createMoney(
      assetBalance.balance.amount,
      metadata.symbol ?? '',
      metadata.decimals ?? 0
    ),
    asset: {
      ...assetBalance.asset,
      canTransfer: isTransferableStacksFungibleTokenAsset(assetBalance.asset),
      decimals: metadata.decimals ?? 0,
      hasMemo: isTransferableStacksFungibleTokenAsset(assetBalance.asset),
      imageCanonicalUri: metadata.image_canonical_uri ?? '',
      name: metadata.name ?? '',
      price,
      symbol: metadata.symbol ?? '',
    },
  };
}

export function getStacksFungibleTokenCurrencyAssetBalance(
  selectedAssetBalance?: StacksCryptoCurrencyAssetBalance | StacksFungibleTokenAssetBalance
) {
  return selectedAssetBalance?.type === 'fungible-token' && selectedAssetBalance.asset.canTransfer
    ? selectedAssetBalance
    : undefined;
}
