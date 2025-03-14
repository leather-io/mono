import { injectable } from 'inversify';

import { btcCryptoAsset, stxCryptoAsset } from '@leather.io/constants';
import {
  AccountAddresses,
  Activity,
  CryptoAssetCategories,
  CryptoAssetInfo,
  OnChainActivity,
  OnChainActivityTypes,
  Sip10CryptoAssetInfo,
} from '@leather.io/models';
import {
  baseCurrencyAmountInQuote,
  createMoney,
  hasBitcoinAddress,
  hasStacksAddress,
  isDefined,
} from '@leather.io/utils';

import { Sip9AssetService } from '../assets/sip9-asset.service';
import { Sip10AssetService } from '../assets/sip10-asset.service';
import { getAssetIdentifierFromContract } from '../assets/stacks-asset.utils';
import {
  HiroStacksApiClient,
  HiroStacksMempoolTransaction,
  HiroStacksTransaction,
  HiroTransactionEvent,
} from '../infrastructure/api/hiro/hiro-stacks-api.client';
import { MarketDataService } from '../market-data/market-data.service';
import { BitcoinTransactionsService } from '../transactions/bitcoin-transactions.service';
import { StacksTransactionsService } from '../transactions/stacks-transactions.service';
import { sortActivityByTimestampDesc } from './activity.utils';
import { mapBitcoinTxToActivity } from './bitcoin-tx-activity.utils';
import {
  StacksAssetTransfer,
  StacksAssetTransferWithInfo,
  getStacksAssetTransfers,
} from './stacks-asset-transfer.utils';
import {
  getEventsByTxId,
  mapContractCallActivity,
  mapSmartContractActivity,
  mapTokenTransferActivity,
} from './stacks-tx-activity.utils';

@injectable()
export class ActivityService {
  constructor(
    private readonly hiroStacksApiClient: HiroStacksApiClient,
    private readonly stacksTransactionsService: StacksTransactionsService,
    private readonly bitcoinTransactionsService: BitcoinTransactionsService,
    private readonly marketDataService: MarketDataService,
    private readonly sip10AssetService: Sip10AssetService,
    private readonly sip9AssetService: Sip9AssetService
  ) {}
  /*
   * Gets combined total activity for a list of accounts
   */
  public async getTotalActivity(
    accounts: AccountAddresses[],
    signal?: AbortSignal
  ): Promise<Activity[]> {
    const activityLists = await Promise.all(accounts.map(a => this.getAccountActivity(a, signal)));
    return activityLists.flat().sort(sortActivityByTimestampDesc);
  }

  /*
   * Gets activity list for an account
   */
  public async getAccountActivity(
    account: AccountAddresses,
    signal?: AbortSignal
  ): Promise<Activity[]> {
    const [btcActivity, stacksActivity] = await Promise.all([
      this.getBtcActivity(account, signal),
      this.getStacksActivity(account, signal),
    ]);
    return [...btcActivity, ...stacksActivity].sort(sortActivityByTimestampDesc);
  }

  /*
   * Gets activity list for an account restricted to a single asset
   */
  public async getActivityByAsset(
    account: AccountAddresses,
    asset: CryptoAssetInfo,
    signal?: AbortSignal
  ): Promise<Activity[]> {
    switch (asset.protocol) {
      case 'nativeBtc':
        return await this.getBtcActivity(account, signal);
      case 'nativeStx':
        return await this.getStxActivity(account, signal);
      case 'sip10':
        return await this.getSip10Activity(asset, account, signal);
      default:
        return [];
    }
  }

  /*
   *  Gets BTC Asset activity list for an account
   */
  public async getBtcActivity(
    account: AccountAddresses,
    signal?: AbortSignal
  ): Promise<Activity[]> {
    if (!hasBitcoinAddress(account)) return [];

    const [bitcoinTransactions] = await Promise.all([
      this.bitcoinTransactionsService.getAccountTransactions(account, signal),
      this.marketDataService.getMarketData(btcCryptoAsset, signal),
    ]);
    const activityList: Activity[] = [];
    for (const tx of bitcoinTransactions) {
      const txActivity = mapBitcoinTxToActivity(tx, account);
      if (txActivity) {
        activityList.push(await this.applyMarketData(txActivity));
      }
    }
    return activityList.sort(sortActivityByTimestampDesc);
  }

  /*
   *  Gets Stacks chain activity list for an account
   */
  public async getStacksActivity(
    account: AccountAddresses,
    signal?: AbortSignal
  ): Promise<Activity[]> {
    if (!hasStacksAddress(account)) return [];

    const [pendingTxs, txs, txEvents] = await Promise.all([
      this.stacksTransactionsService.getPendingTransactions(account.stacks.stxAddress, signal),
      this.hiroStacksApiClient.getAddressTransactions(
        account.stacks.stxAddress,
        { pages: 2 },
        signal
      ),
      this.hiroStacksApiClient.getTransactionEvents(
        account.stacks.stxAddress,
        { pages: 2 },
        signal
      ),
    ]);
    const eventsByTxId = getEventsByTxId(txEvents);
    const activityList: Activity[] = [];
    for (const tx of [...pendingTxs, ...txs.map(tx => tx.tx)]) {
      const txActivity = await this.getStacksTxActivity(tx, eventsByTxId.get(tx.tx_id), account);
      if (txActivity) {
        activityList.push(
          ...(await Promise.all(txActivity.map(activity => this.applyMarketData(activity, signal))))
        );
      }
    }
    return activityList.sort(sortActivityByTimestampDesc);
  }

  /*
   *  Gets STX asset activity list for an account
   */
  public async getStxActivity(
    account: AccountAddresses,
    signal?: AbortSignal
  ): Promise<Activity[]> {
    if (!hasStacksAddress(account)) return [];

    const [pendingTxs, txs, txEvents] = await Promise.all([
      this.stacksTransactionsService.getPendingTransactions(account.stacks.stxAddress, signal),
      this.hiroStacksApiClient.getAddressTransactions(
        account.stacks.stxAddress,
        { pages: 2 },
        signal
      ),
      this.hiroStacksApiClient.getTransactionEvents(
        account.stacks.stxAddress,
        { pages: 2 },
        signal
      ),
    ]);
    const stxEventsByTxId = getEventsByTxId(
      txEvents.filter(event => event.event_type === 'stx_asset' || event.event_type === 'stx_lock')
    );
    const activityList: Activity[] = [];
    for (const tx of [
      ...pendingTxs,
      ...txs.filter(tx => stxEventsByTxId.has(tx.tx.tx_id)).map(tx => tx.tx),
    ]) {
      const txActivity = await this.getStacksTxActivity(tx, stxEventsByTxId.get(tx.tx_id), account);
      if (txActivity) {
        activityList.push(
          ...(await Promise.all(txActivity.map(activity => this.applyMarketData(activity, signal))))
        );
      }
    }
    return activityList.sort(sortActivityByTimestampDesc);
  }

  /*
   *  Gets SIP10 asset activity list for an account
   */
  public async getSip10Activity(
    asset: Sip10CryptoAssetInfo,
    account: AccountAddresses,
    signal?: AbortSignal
  ): Promise<Activity[]> {
    if (!hasStacksAddress(account)) return [];

    const [pendingTxs, txs, txEvents] = await Promise.all([
      this.stacksTransactionsService.getPendingTransactions(account.stacks.stxAddress, signal),
      this.hiroStacksApiClient.getAddressTransactions(
        account.stacks.stxAddress,
        { pages: 2 },
        signal
      ),
      this.hiroStacksApiClient.getTransactionEvents(
        account.stacks.stxAddress,
        { pages: 2 },
        signal
      ),
    ]);
    const eventsByTxId = getEventsByTxId(txEvents);
    const sip10AssetTxs = txs.filter(tx =>
      tx.tx.post_conditions.some(
        pc =>
          pc.type === 'fungible' &&
          getAssetIdentifierFromContract(
            pc.asset.contract_address,
            pc.asset.contract_name,
            pc.asset.asset_name
          ) === asset.assetId
      )
    );
    const activityList: Activity[] = [];
    for (const tx of [...pendingTxs, ...sip10AssetTxs.map(tx => tx.tx)]) {
      const txActivity = await this.getStacksTxActivity(tx, eventsByTxId.get(tx.tx_id), account);
      if (txActivity) {
        activityList.push(
          ...(await Promise.all(txActivity.map(activity => this.applyMarketData(activity, signal))))
        );
      }
    }
    return activityList.sort(sortActivityByTimestampDesc);
  }

  private async getStacksTxActivity(
    tx: HiroStacksTransaction | HiroStacksMempoolTransaction,
    txEvents: HiroTransactionEvent[] = [],
    account: AccountAddresses,
    signal?: AbortSignal
  ): Promise<OnChainActivity[]> {
    switch (tx.tx_type) {
      case 'token_transfer':
        return mapTokenTransferActivity(tx, account);
      case 'smart_contract':
        return mapSmartContractActivity(
          tx,
          account,
          await this.getStacksAssetTransfersWithInfo(tx, txEvents, signal)
        );
      case 'contract_call':
        return mapContractCallActivity(
          tx,
          account,
          await this.getStacksAssetTransfersWithInfo(tx, txEvents, signal)
        );
      default:
        return [];
    }
  }

  private async getStacksAssetTransfersWithInfo(
    tx: HiroStacksTransaction | HiroStacksMempoolTransaction,
    txEvents: HiroTransactionEvent[],
    signal?: AbortSignal
  ): Promise<StacksAssetTransferWithInfo[]> {
    const transfers = getStacksAssetTransfers(tx, txEvents);
    return (
      await Promise.all(transfers.map(t => this.addStacksTransferAssetInfo(t, signal)))
    ).filter(isDefined);
  }

  private async addStacksTransferAssetInfo(
    transfer: StacksAssetTransfer,
    signal?: AbortSignal
  ): Promise<StacksAssetTransferWithInfo | undefined> {
    if (transfer.assetId === 'STX') {
      return {
        ...transfer,
        assetInfo: stxCryptoAsset,
      };
    } else {
      try {
        return {
          ...transfer,
          assetInfo:
            transfer.assetCategory === CryptoAssetCategories.fungible
              ? await this.sip10AssetService.getAssetInfo(transfer.assetId, signal)
              : await this.sip9AssetService.getAssetInfo(
                  transfer.assetId,
                  transfer.tokenValue!,
                  signal
                ),
        };
      } catch {
        // if we're unable to find asset metadata, remove transfer
        return undefined;
      }
    }
  }

  private async applyMarketData(activity: Activity, signal?: AbortSignal) {
    if (
      activity.type === OnChainActivityTypes.sendAsset ||
      activity.type === OnChainActivityTypes.receiveAsset
    ) {
      const isTransferAssetFungible = activity.asset.category === CryptoAssetCategories.fungible;
      if (isTransferAssetFungible) {
        const assetMarketData = await this.marketDataService.getMarketData(activity.asset, signal);
        const cryptoValue = createMoney(
          activity.amount,
          activity.asset.symbol,
          activity.asset.decimals
        );
        return {
          ...activity,
          value: {
            crypto: cryptoValue,
            fiat: baseCurrencyAmountInQuote(cryptoValue, assetMarketData),
          },
        };
      }
    } else if (activity.type === OnChainActivityTypes.swapAssets) {
      const isSwapFromAssetFungible =
        activity.fromAsset.category === CryptoAssetCategories.fungible;
      const isSwapToAssetFungible = activity.toAsset.category === CryptoAssetCategories.fungible;

      let fromAssetValue,
        toAssetValue = undefined;
      if (isSwapFromAssetFungible) {
        const fromAssetMarketData = await this.marketDataService.getMarketData(
          activity.fromAsset,
          signal
        );
        const cryptoFromValue = createMoney(
          activity.fromAmount,
          activity.fromAsset.symbol,
          activity.fromAsset.decimals
        );
        fromAssetValue = {
          crypto: cryptoFromValue,
          fiat: baseCurrencyAmountInQuote(cryptoFromValue, fromAssetMarketData),
        };
      }
      if (isSwapToAssetFungible) {
        const toAssetMarketData = await this.marketDataService.getMarketData(
          activity.toAsset,
          signal
        );
        const cryptoToValue = createMoney(
          activity.toAmount,
          activity.toAsset.symbol,
          activity.toAsset.decimals
        );
        toAssetValue = {
          crypto: cryptoToValue,
          fiat: baseCurrencyAmountInQuote(cryptoToValue, toAssetMarketData),
        };
      }
      return {
        ...activity,
        fromValue: fromAssetValue,
        toValue: toAssetValue,
      };
    }
    return activity;
  }
}
