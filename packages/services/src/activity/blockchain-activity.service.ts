import { injectable } from 'inversify';

import { stxAsset } from '@leather.io/constants';
import {
  AccountAddresses,
  BlockchainActivity,
  BlockchainActivityEvent,
  CryptoAssetCategories,
  StacksProtocolAction,
  StacksProtocolId,
  isFungibleAsset,
} from '@leather.io/models';
import {
  baseCurrencyAmountInQuote,
  createMoney,
  hasBitcoinAddress,
  hasStacksAddress,
  initBigNumber,
  isDefined,
} from '@leather.io/utils';

import { Sip9AssetService } from '../assets/sip9-asset.service';
import { Sip10AssetService } from '../assets/sip10-asset.service';
import { HiroStacksApiClient } from '../infrastructure/api/hiro/hiro-stacks-api.client';
import {
  HiroStacksMempoolTransaction,
  HiroStacksTransaction,
  HiroTransactionEvent,
} from '../infrastructure/api/hiro/hiro-stacks-api.types';
import { MarketDataService } from '../market/market-data.service';
import { StacksProtocolService } from '../protocols/stacks-protocol.service';
import { BitcoinTransactionsService } from '../transactions/bitcoin-transactions.service';
import { StacksTransactionsService } from '../transactions/stacks-transactions.service';
import { filterActivityByAsset, sortActivityByTimestampDesc } from './activity.utils';
import { mapBitcoinTxToActivity } from './bitcoin-blockchain-activity.utils';
import type { ActivityRequest, ActivityResponse } from './blockchain-activity.types';
import { StacksRawActivityEvent, extractStacksRawEvents } from './stacks-activity-event.utils';
import { StacksAssetTransfer, getStacksAssetTransfers } from './stacks-asset-transfer.utils';
import {
  mapStacksContractCall,
  mapStacksSmartContractDeploy,
  mapStacksTokenTransfer,
} from './stacks-blockchain-activity.utils';
import { getEventsByTxId, isMempoolTx } from './stacks-tx-activity.utils';

@injectable()
export class BlockchainActivityService {
  constructor(
    private readonly hiroStacksApiClient: HiroStacksApiClient,
    private readonly stacksTransactionsService: StacksTransactionsService,
    private readonly bitcoinTransactionsService: BitcoinTransactionsService,
    private readonly marketDataService: MarketDataService,
    private readonly sip10AssetService: Sip10AssetService,
    private readonly sip9AssetService: Sip9AssetService,
    private readonly stacksProtocolService: StacksProtocolService
  ) {}

  public async getActivity(
    request: ActivityRequest,
    signal?: AbortSignal
  ): Promise<ActivityResponse> {
    let allActivity = await this.fetchAllActivity(request.account, signal);

    if (request.filter?.asset) {
      allActivity = filterActivityByAsset(allActivity, request.filter.asset);
    } else if (request.filter?.protocol) {
      allActivity = allActivity.filter(
        a => a.contract?.type === 'call' && a.contract.protocol === request.filter!.protocol
      );
    } else if (request.filter?.chain) {
      allActivity = allActivity.filter(a => a.chain === request.filter!.chain);
    }

    const total = allActivity.length;
    const pagination = request.pagination;
    const page = pagination
      ? allActivity.slice(pagination.offset, pagination.offset + pagination.limit)
      : allActivity;

    const items = await Promise.all(page.map(a => this.enrichWithMarketData(a, signal)));

    return {
      items,
      meta: {
        total,
        limit: pagination?.limit ?? total,
        offset: pagination?.offset ?? 0,
      },
    };
  }

  private async fetchAllActivity(
    account: AccountAddresses,
    signal?: AbortSignal
  ): Promise<BlockchainActivity[]> {
    const [btcActivity, stacksActivity] = await Promise.all([
      this.getBtcActivity(account, signal),
      this.getStacksActivity(account, signal),
    ]);
    return [...btcActivity, ...stacksActivity].sort(sortActivityByTimestampDesc);
  }

  private async getBtcActivity(
    account: AccountAddresses,
    signal?: AbortSignal
  ): Promise<BlockchainActivity[]> {
    if (!hasBitcoinAddress(account)) return [];

    const bitcoinTxs = await this.bitcoinTransactionsService.getAccountTransactions(
      account,
      signal
    );
    return bitcoinTxs
      .map(mapBitcoinTxToActivity)
      .filter(isDefined)
      .sort(sortActivityByTimestampDesc);
  }

  private async getStacksActivity(
    account: AccountAddresses,
    signal?: AbortSignal
  ): Promise<BlockchainActivity[]> {
    if (!hasStacksAddress(account)) return [];

    const [pendingTxs, txs, txEvents] = await Promise.all([
      this.stacksTransactionsService.getPendingTransactions(account.stacks.stxAddress, signal),
      this.hiroStacksApiClient.getAddressTransactions(
        account.stacks.stxAddress,
        { allPages: true, stopAfter: 20 },
        { signal }
      ),
      this.hiroStacksApiClient.getTransactionEvents(
        account.stacks.stxAddress,
        { allPages: true, stopAfter: 20 },
        { signal }
      ),
    ]);

    const eventsByTxId = getEventsByTxId(txEvents);
    const allTxs = [...pendingTxs, ...txs.map(t => t.tx)];
    const results = await Promise.all(
      allTxs.map(tx =>
        this.getStacksTxActivity(tx, eventsByTxId.get(tx.tx_id) ?? [], account, signal)
      )
    );
    return results.filter(isDefined).sort(sortActivityByTimestampDesc);
  }

  private async getStacksTxActivity(
    tx: HiroStacksTransaction | HiroStacksMempoolTransaction,
    txEvents: HiroTransactionEvent[],
    account: AccountAddresses,
    signal?: AbortSignal
  ): Promise<BlockchainActivity | undefined> {
    switch (tx.tx_type) {
      case 'token_transfer':
        return mapStacksTokenTransfer(tx, account);
      case 'smart_contract': {
        const events = await this.resolveStacksEvents(tx, txEvents, account, signal);
        return mapStacksSmartContractDeploy(tx, account, events);
      }
      case 'contract_call': {
        const [events, protocolInfo] = await Promise.all([
          this.resolveStacksEvents(tx, txEvents, account, signal),
          this.resolveProtocolInfo(
            tx.contract_call.contract_id,
            tx.contract_call.function_name,
            signal
          ),
        ]);
        return mapStacksContractCall(tx, account, events, protocolInfo);
      }
      default:
        return;
    }
  }

  private async resolveStacksEvents(
    tx: HiroStacksTransaction | HiroStacksMempoolTransaction,
    txEvents: HiroTransactionEvent[],
    account: AccountAddresses,
    signal?: AbortSignal
  ): Promise<BlockchainActivityEvent[]> {
    const stxAddress = account.stacks?.stxAddress;
    if (!stxAddress) return [];

    if (isMempoolTx(tx)) {
      const transfers = getStacksAssetTransfers(tx, []);
      return this.resolveTransfersToEvents(transfers, stxAddress, signal);
    }

    const rawEvents = extractStacksRawEvents(txEvents, stxAddress);
    return this.resolveRawEvents(rawEvents, signal);
  }

  private async resolveRawEvents(
    rawEvents: StacksRawActivityEvent[],
    signal?: AbortSignal
  ): Promise<BlockchainActivityEvent[]> {
    const events = await Promise.all(rawEvents.map(raw => this.resolveRawEvent(raw, signal)));
    return events.filter(isDefined);
  }

  private async resolveRawEvent(
    raw: StacksRawActivityEvent,
    signal?: AbortSignal
  ): Promise<BlockchainActivityEvent | undefined> {
    try {
      if (raw.assetIdentifier === 'STX') {
        return {
          action: raw.action,
          asset: stxAsset,
          counterparty: raw.counterparty,
          amount: {
            crypto: createMoney(initBigNumber(raw.rawAmount), 'STX'),
            quote: createMoney(0, 'USD'),
          },
        };
      }

      if (raw.nftTokenHex) {
        const sip9Asset = await this.sip9AssetService.getAsset(
          raw.assetIdentifier,
          raw.nftTokenHex,
          signal
        );
        return {
          action: raw.action,
          asset: sip9Asset,
          counterparty: raw.counterparty,
          amount: {
            crypto: createMoney(1, sip9Asset.name, 0),
            quote: createMoney(0, 'USD'),
          },
        };
      }

      const sip10Asset = await this.sip10AssetService.getAsset(raw.assetIdentifier, signal);
      return {
        action: raw.action,
        asset: sip10Asset,
        counterparty: raw.counterparty,
        amount: {
          crypto: createMoney(initBigNumber(raw.rawAmount), sip10Asset.symbol, sip10Asset.decimals),
          quote: createMoney(0, 'USD'),
        },
      };
    } catch {
      return undefined;
    }
  }

  private async resolveTransfersToEvents(
    transfers: StacksAssetTransfer[],
    stxAddress: string,
    signal?: AbortSignal
  ): Promise<BlockchainActivityEvent[]> {
    const events = await Promise.all(
      transfers.map(t => this.resolveTransferToEvent(t, stxAddress, signal))
    );
    return events.filter(isDefined);
  }

  private async resolveTransferToEvent(
    transfer: StacksAssetTransfer,
    stxAddress: string,
    signal?: AbortSignal
  ): Promise<BlockchainActivityEvent | undefined> {
    try {
      const isSent = transfer.sender === stxAddress;

      if (transfer.assetId === 'STX') {
        return {
          action: isSent ? 'sent' : 'received',
          asset: stxAsset,
          counterparty: isSent ? transfer.receiver : transfer.sender,
          amount: {
            crypto: createMoney(initBigNumber(transfer.tokenValue ?? '0'), 'STX'),
            quote: createMoney(0, 'USD'),
          },
        };
      }

      if (transfer.assetCategory === CryptoAssetCategories.nft && transfer.tokenValue) {
        const sip9Asset = await this.sip9AssetService.getAsset(
          transfer.assetId,
          transfer.tokenValue,
          signal
        );
        return {
          action: isSent ? 'sent' : 'received',
          asset: sip9Asset,
          counterparty: isSent ? transfer.receiver : transfer.sender,
          amount: {
            crypto: createMoney(1, sip9Asset.name, 0),
            quote: createMoney(0, 'USD'),
          },
        };
      }

      const sip10Asset = await this.sip10AssetService.getAsset(transfer.assetId, signal);
      return {
        action: isSent ? 'sent' : 'received',
        asset: sip10Asset,
        counterparty: isSent ? transfer.receiver : transfer.sender,
        amount: {
          crypto: createMoney(
            initBigNumber(transfer.tokenValue ?? '0'),
            sip10Asset.symbol,
            sip10Asset.decimals
          ),
          quote: createMoney(0, 'USD'),
        },
      };
    } catch {
      return undefined;
    }
  }

  private async resolveProtocolInfo(
    contractId: string,
    functionName: string,
    signal?: AbortSignal
  ): Promise<{ protocol?: StacksProtocolId; action?: StacksProtocolAction }> {
    const [address, contractName] = contractId.split('.');
    const protocol = await this.stacksProtocolService.getProtocolByAddress(address, signal);
    if (!protocol) return {};
    const action = await this.stacksProtocolService.getContractActionType(
      protocol.id,
      contractName,
      functionName,
      signal
    );
    return {
      protocol: protocol.id,
      action: action ?? undefined,
    };
  }

  private async enrichWithMarketData(
    activity: BlockchainActivity,
    signal?: AbortSignal
  ): Promise<BlockchainActivity> {
    if (activity.events.length === 0) return activity;
    const enrichedEvents = await Promise.all(
      activity.events.map(event => this.enrichEventWithMarketData(event, signal))
    );
    return { ...activity, events: enrichedEvents };
  }

  private async enrichEventWithMarketData(
    event: BlockchainActivityEvent,
    signal?: AbortSignal
  ): Promise<BlockchainActivityEvent> {
    if (!isFungibleAsset(event.asset)) return event;
    try {
      const marketData = await this.marketDataService.getMarketData(event.asset, signal);
      return {
        ...event,
        amount: {
          crypto: event.amount.crypto,
          quote: baseCurrencyAmountInQuote(event.amount.crypto, marketData),
        },
      };
    } catch {
      return event;
    }
  }
}
