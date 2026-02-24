import {
  TransactionEventFungibleAsset,
  TransactionEventNonFungibleAsset,
  TransactionEventStxAsset,
  TransactionEventStxLock,
} from '@stacks/stacks-blockchain-api-types';
import BigNumber from 'bignumber.js';

import { BlockchainActivityEventAction } from '@leather.io/models';

import { HiroTransactionEvent } from '../infrastructure/api/hiro/hiro-stacks-api.types';

export interface StacksRawActivityEvent {
  readonly action: BlockchainActivityEventAction;
  readonly assetIdentifier: string;
  readonly counterparty?: string;
  readonly rawAmount: string;
  readonly nftTokenHex?: string;
}

export function extractStacksRawEvents(
  txEvents: HiroTransactionEvent[],
  stxAddress: string
): StacksRawActivityEvent[] {
  const events: StacksRawActivityEvent[] = [];

  for (const event of txEvents) {
    switch (event.event_type) {
      case 'stx_asset':
        extractStxAssetEvent(event, stxAddress, events);
        break;
      case 'stx_lock':
        extractStxLockEvent(event, stxAddress, events);
        break;
      case 'fungible_token_asset':
        extractFungibleTokenEvent(event, stxAddress, events);
        break;
      case 'non_fungible_token_asset':
        extractNonFungibleTokenEvent(event, stxAddress, events);
        break;
      default:
        break;
    }
  }

  return consolidateRawEvents(events);
}

function consolidateRawEvents(events: StacksRawActivityEvent[]): StacksRawActivityEvent[] {
  const passthrough: StacksRawActivityEvent[] = [];
  const transfersByAsset = new Map<
    string,
    { sent: StacksRawActivityEvent[]; received: StacksRawActivityEvent[] }
  >();

  for (const event of events) {
    if (event.nftTokenHex || (event.action !== 'sent' && event.action !== 'received')) {
      passthrough.push(event);
      continue;
    }

    let bucket = transfersByAsset.get(event.assetIdentifier);
    if (!bucket) {
      bucket = { sent: [], received: [] };
      transfersByAsset.set(event.assetIdentifier, bucket);
    }
    bucket[event.action].push(event);
  }

  const consolidated: StacksRawActivityEvent[] = [...passthrough];

  for (const [assetIdentifier, { sent, received }] of transfersByAsset) {
    const totalSent = sent.reduce((sum, e) => sum.plus(e.rawAmount), new BigNumber(0));
    const totalReceived = received.reduce((sum, e) => sum.plus(e.rawAmount), new BigNumber(0));
    const net = totalReceived.minus(totalSent);

    if (net.isZero()) continue;

    const action: BlockchainActivityEventAction = net.isPositive() ? 'received' : 'sent';
    const largestEvent = (net.isPositive() ? received : sent).reduce((max, e) =>
      new BigNumber(e.rawAmount).gt(max.rawAmount) ? e : max
    );

    consolidated.push({
      action,
      assetIdentifier,
      counterparty: largestEvent.counterparty,
      rawAmount: net.abs().toFixed(0),
    });
  }

  return consolidated;
}

function extractStxAssetEvent(
  event: TransactionEventStxAsset,
  stxAddress: string,
  events: StacksRawActivityEvent[]
) {
  const { asset } = event;
  if (!asset.asset_event_type || !asset.amount) return;

  if (asset.asset_event_type === 'transfer') {
    if (asset.sender === stxAddress) {
      events.push({
        action: 'sent',
        assetIdentifier: 'STX',
        counterparty: asset.recipient,
        rawAmount: asset.amount,
      });
    } else if (asset.recipient === stxAddress) {
      events.push({
        action: 'received',
        assetIdentifier: 'STX',
        counterparty: asset.sender,
        rawAmount: asset.amount,
      });
    }
  } else if (asset.asset_event_type === 'mint') {
    if (asset.recipient === stxAddress) {
      events.push({
        action: 'minted',
        assetIdentifier: 'STX',
        rawAmount: asset.amount,
      });
    }
  } else if (asset.asset_event_type === 'burn') {
    if (asset.sender === stxAddress) {
      events.push({
        action: 'burned',
        assetIdentifier: 'STX',
        rawAmount: asset.amount,
      });
    }
  }
}

function extractStxLockEvent(
  event: TransactionEventStxLock,
  stxAddress: string,
  events: StacksRawActivityEvent[]
) {
  if (event.stx_lock_event.locked_address === stxAddress) {
    events.push({
      action: 'locked',
      assetIdentifier: 'STX',
      rawAmount: event.stx_lock_event.locked_amount,
    });
  }
}

function extractFungibleTokenEvent(
  event: TransactionEventFungibleAsset,
  stxAddress: string,
  events: StacksRawActivityEvent[]
) {
  const { asset } = event;

  if (asset.asset_event_type === 'transfer') {
    if (asset.sender === stxAddress) {
      events.push({
        action: 'sent',
        assetIdentifier: asset.asset_id,
        counterparty: asset.recipient,
        rawAmount: asset.amount,
      });
    } else if (asset.recipient === stxAddress) {
      events.push({
        action: 'received',
        assetIdentifier: asset.asset_id,
        counterparty: asset.sender,
        rawAmount: asset.amount,
      });
    }
  } else if (asset.asset_event_type === 'mint') {
    if (asset.recipient === stxAddress) {
      events.push({
        action: 'minted',
        assetIdentifier: asset.asset_id,
        rawAmount: asset.amount,
      });
    }
  } else if (asset.asset_event_type === 'burn') {
    if (asset.sender === stxAddress) {
      events.push({
        action: 'burned',
        assetIdentifier: asset.asset_id,
        rawAmount: asset.amount,
      });
    }
  }
}

function extractNonFungibleTokenEvent(
  event: TransactionEventNonFungibleAsset,
  stxAddress: string,
  events: StacksRawActivityEvent[]
) {
  const { asset } = event;

  if (asset.asset_event_type === 'transfer') {
    if (asset.sender === stxAddress) {
      events.push({
        action: 'sent',
        assetIdentifier: asset.asset_id,
        counterparty: asset.recipient,
        rawAmount: '1',
        nftTokenHex: asset.value.hex,
      });
    } else if (asset.recipient === stxAddress) {
      events.push({
        action: 'received',
        assetIdentifier: asset.asset_id,
        counterparty: asset.sender,
        rawAmount: '1',
        nftTokenHex: asset.value.hex,
      });
    }
  } else if (asset.asset_event_type === 'mint') {
    if (asset.recipient === stxAddress) {
      events.push({
        action: 'minted',
        assetIdentifier: asset.asset_id,
        rawAmount: '1',
        nftTokenHex: asset.value.hex,
      });
    }
  } else if (asset.asset_event_type === 'burn') {
    if (asset.sender === stxAddress) {
      events.push({
        action: 'burned',
        assetIdentifier: asset.asset_id,
        rawAmount: '1',
        nftTokenHex: asset.value.hex,
      });
    }
  }
}
