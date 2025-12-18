import type { AddressTransactionWithTransfers } from '@stacks/stacks-blockchain-api-types';

import { FtTransfer } from '@leather.io/models';
import { isFtAsset } from '@leather.io/query';
import { getPrincipalFromAssetString } from '@leather.io/stacks';
import { ArrowDownIcon, ArrowUpIcon, AssetAvatarIcon } from '@leather.io/ui';

import { logger } from '@shared/logger';

import { getSafeImageCanonicalUri } from '@app/common/stacks-utils';
import {
  calculateTokenTransferAmount,
  getTxCaption,
} from '@app/common/transactions/stacks/transaction.utils';
import { StacksTransactionItem } from '@app/components/stacks-transaction-item/stacks-transaction-item';
import { useGetFungibleTokenMetadataQuery } from '@app/query/stacks/token-metadata/fungible-tokens/fungible-token-metadata.query';
import { useCurrentStacksAccount } from '@app/store/accounts/blockchain/stacks/stacks-account.hooks';

import { TxTransferIconWrapper } from './tx-transfer-icon-wrapper';

interface FtTransferItemProps {
  ftTransfer: FtTransfer;
  parentTx: AddressTransactionWithTransfers;
}
export function FtTransferItem({ ftTransfer, parentTx }: FtTransferItemProps) {
  const { data: assetMetadata } = useGetFungibleTokenMetadataQuery(
    getPrincipalFromAssetString(ftTransfer.asset_identifier)
  );
  const currentAccount = useCurrentStacksAccount();
  const isOriginator = ftTransfer.sender === currentAccount?.address;

  if (!(assetMetadata && isFtAsset(assetMetadata))) {
    logger.error('Token metadata not found');
    return null;
  }

  const displayAmount = calculateTokenTransferAmount(
    assetMetadata?.decimals ?? 0,
    ftTransfer.amount
  );
  if (typeof displayAmount === 'undefined') return null;

  const caption = getTxCaption(parentTx.tx) ?? '';
  const ftImageCanonicalUri =
    assetMetadata.image_canonical_uri &&
    assetMetadata.name &&
    getSafeImageCanonicalUri(assetMetadata.image_canonical_uri, assetMetadata.name);
  const icon = isOriginator ? (
    <ArrowUpIcon color="ink.background-primary" variant="small" />
  ) : (
    <ArrowDownIcon color="ink.background-primary" variant="small" />
  );
  const title = `${assetMetadata.name || 'Token'} Transfer`;
  const value = `${isOriginator ? '-' : ''}${displayAmount.toFormat()}`;
  const transferIcon = ftImageCanonicalUri ? (
    <AssetAvatarIcon
      asset={{
        protocol: 'sip10',
        contractId: ftTransfer.asset_identifier,
        imageCanonicalUri: ftImageCanonicalUri,
        name: assetMetadata.name || 'Token',
      }}
      size="xl"
    />
  ) : (
    <TxTransferIconWrapper icon={icon} />
  );

  return (
    <StacksTransactionItem
      caption={caption}
      icon={transferIcon}
      link={parentTx.tx.tx_id}
      title={title}
      value={value}
    />
  );
}
