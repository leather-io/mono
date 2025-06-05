import { PostCondition } from '@stacks/stacks-blockchain-api-types';
import BigNumber from 'bignumber.js';

import { CryptoAssetCategories, CryptoAssetCategory, CryptoAssetInfo } from '@leather.io/models';
import { isDefined, sumNumbers, uniqueArray } from '@leather.io/utils';

import {
  getAssetIdentifierFromContract,
  getContractPrincipalFromAddressAndName,
} from '../assets/stacks-asset.utils';
import {
  HiroStacksMempoolTransaction,
  HiroStacksTransaction,
  HiroTransactionEvent,
} from '../infrastructure/api/hiro/hiro-stacks-api.types';
import { isMempoolTx } from './stacks-tx-activity.utils';

export interface StacksAssetTransfer {
  assetCategory: CryptoAssetCategory;
  assetId: string;
  sender?: string;
  receiver?: string;
  tokenValue?: string;
}

export interface StacksAssetTransferWithInfo extends StacksAssetTransfer {
  assetInfo: CryptoAssetInfo;
}

export function sumAssetTransferAmounts(transfers: StacksAssetTransfer[]): BigNumber {
  if (transfers.length === 0) return new BigNumber(0);

  const assetId = transfers[0].assetId;
  if (transfers.some(t => t.assetId !== assetId)) {
    throw new Error(`Cannot sum transfers of different assets`);
  }

  return sumNumbers(
    transfers.map(t =>
      t.assetCategory === CryptoAssetCategories.fungible ? Number(t.tokenValue) : 1
    )
  );
}

export function aggregateTransferSenders(transfers: StacksAssetTransfer[]): string[] {
  return uniqueArray(transfers.map(transfer => transfer.sender).filter(isDefined));
}

export function aggregateTransferReceivers(transfers: StacksAssetTransfer[]): string[] {
  return uniqueArray(transfers.map(transfer => transfer.receiver).filter(isDefined));
}

export function mapTransferFromTxEvent(
  event: HiroTransactionEvent
): StacksAssetTransfer | undefined {
  if (event.event_type === 'stx_asset') {
    return {
      assetCategory: CryptoAssetCategories.fungible,
      assetId: 'STX',
      sender: event.asset.sender,
      receiver: event.asset.recipient,
      tokenValue: event.asset.amount,
    };
  }
  if (event.event_type === 'fungible_token_asset') {
    return {
      assetCategory: CryptoAssetCategories.fungible,
      assetId: event.asset.asset_id,
      sender: event.asset.sender,
      receiver: event.asset.recipient,
      tokenValue: event.asset.amount,
    };
  }
  if (event.event_type === 'non_fungible_token_asset') {
    return {
      assetCategory: CryptoAssetCategories.nft,
      assetId: event.asset.asset_id,
      sender: event.asset.sender,
      receiver: event.asset.recipient,
      tokenValue: event.asset.value.hex,
    };
  }
  return;
}

export function mapTransferFromPostCondition(pc: PostCondition): StacksAssetTransfer | undefined {
  if (pc.principal.type_id !== 'principal_origin') {
    if (pc.type === 'stx') {
      return {
        assetCategory: CryptoAssetCategories.fungible,
        assetId: 'STX',
        sender: pc.principal.address,
        tokenValue: pc.amount,
      };
    }
    if (pc.type === 'fungible') {
      return {
        assetCategory: CryptoAssetCategories.fungible,
        assetId: getAssetIdentifierFromContract(
          pc.asset.contract_address,
          pc.asset.contract_name,
          pc.asset.asset_name
        ),
        sender: pc.principal.address,
        tokenValue: pc.amount,
      };
    }
    if (pc.type === 'non_fungible') {
      return {
        assetCategory: CryptoAssetCategories.fungible,
        assetId: getAssetIdentifierFromContract(
          pc.asset.contract_address,
          pc.asset.contract_name,
          pc.asset.asset_name
        ),
        sender: pc.principal.address,
        tokenValue: pc.asset_value.hex,
      };
    }
  }
  return;
}

export function getStacksAssetTransfers(
  tx: HiroStacksTransaction | HiroStacksMempoolTransaction,
  txEvents: HiroTransactionEvent[]
): StacksAssetTransfer[] {
  if (isMempoolTx(tx)) {
    // Get all pending transfers (stx, ft, nft) directly from PC
    return tx.post_conditions.map(mapTransferFromPostCondition).filter(isDefined);
  }
  const transfers: StacksAssetTransfer[] = [];
  // If confirmed and has PCs, take transfers only from events where PC amount > 0
  tx.post_conditions
    .filter(pc => pc.type !== 'non_fungible' && Number(pc.amount) > 0)
    .forEach(pc => {
      let senderPrincipal = '';
      if (pc.principal.type_id === 'principal_standard') {
        senderPrincipal = pc.principal.address;
      } else if (pc.principal.type_id === 'principal_contract') {
        senderPrincipal = getContractPrincipalFromAddressAndName(
          pc.principal.address,
          pc.principal.contract_name
        );
      }
      if (pc.type === 'stx') {
        transfers.push(
          ...txEvents
            .filter(e => e.event_type === 'stx_asset' && e.asset.sender === senderPrincipal)
            .map(mapTransferFromTxEvent)
            .filter(isDefined)
        );
      } else if (pc.type === 'fungible') {
        transfers.push(
          ...txEvents
            .filter(
              e =>
                e.event_type === 'fungible_token_asset' &&
                e.asset.asset_id ===
                  getAssetIdentifierFromContract(
                    pc.asset.contract_address,
                    pc.asset.contract_name,
                    pc.asset.asset_name
                  ) &&
                e.asset.sender === senderPrincipal
            )
            .map(mapTransferFromTxEvent)
            .filter(isDefined)
        );
      }
    });
  // If no PCs, take FT transfers from events
  if (tx.post_conditions.length === 0) {
    transfers.push(
      ...txEvents
        .filter(e => e.event_type === 'fungible_token_asset')
        .map(mapTransferFromTxEvent)
        .filter(isDefined)
    );
  }
  // Take any NFT transfers from events
  transfers.push(
    ...txEvents
      .filter(e => e.event_type === 'non_fungible_token_asset')
      .map(mapTransferFromTxEvent)
      .filter(isDefined)
  );
  return transfers;
}
