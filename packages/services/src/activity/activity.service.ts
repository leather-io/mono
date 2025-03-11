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

export interface ActivityService {
  getTotalActivity(accounts: AccountAddresses[], signal?: AbortSignal): Promise<Activity[]>;
  getAccountActivity(account: AccountAddresses, signal?: AbortSignal): Promise<Activity[]>;
  getActivityByAsset(
    account: AccountAddresses,
    asset: CryptoAssetInfo,
    signal?: AbortSignal
  ): Promise<Activity[]>;
  getStacksActivity(account: AccountAddresses, signal?: AbortSignal): Promise<Activity[]>;
  getBtcActivity(account: AccountAddresses, signal?: AbortSignal): Promise<Activity[]>;
  getStxActivity(account: AccountAddresses, signal?: AbortSignal): Promise<Activity[]>;
  getSip10Activity(
    asset: Sip10CryptoAssetInfo,
    account: AccountAddresses,
    signal?: AbortSignal
  ): Promise<Activity[]>;
}

export function createActivityService(
  hiroStacksApiClient: HiroStacksApiClient,
  stacksTransactionsService: StacksTransactionsService,
  bitcoinTransactionsService: BitcoinTransactionsService,
  marketDataService: MarketDataService,
  sip10AssetService: Sip10AssetService,
  sip9AssetService: Sip9AssetService
): ActivityService {
  /*
   * Gets combined total activity for a list of accounts
   */
  async function getTotalActivity(accounts: AccountAddresses[], signal?: AbortSignal) {
    const activityLists = await Promise.all(accounts.map(a => getAccountActivity(a, signal)));
    return activityLists.flat().sort(sortActivityByTimestampDesc);
  }

  /*
   * Gets activity list for an account
   */
  async function getAccountActivity(account: AccountAddresses, signal?: AbortSignal) {
    const [btcActivity, stacksActivity] = await Promise.all([
      getBtcActivity(account, signal),
      getStacksActivity(account, signal),
    ]);
    return [...btcActivity, ...stacksActivity].sort(sortActivityByTimestampDesc);
  }

  /*
   * Gets activity list for an account restricted to a single asset
   */
  async function getActivityByAsset(
    account: AccountAddresses,
    asset: CryptoAssetInfo,
    signal?: AbortSignal
  ) {
    switch (asset.protocol) {
      case 'nativeBtc':
        return await getBtcActivity(account, signal);
      case 'nativeStx':
        return await getStxActivity(account, signal);
      case 'sip10':
        return await getSip10Activity(asset, account, signal);
      default:
        return [];
    }
  }

  /*
   *  Gets BTC activity list for an account
   */
  async function getBtcActivity(
    account: AccountAddresses,
    signal?: AbortSignal
  ): Promise<Activity[]> {
    if (!hasBitcoinAddress(account)) return [];

    const [bitcoinTransactions] = await Promise.all([
      bitcoinTransactionsService.getAccountTransactions(account, signal),
      marketDataService.getMarketData(btcCryptoAsset, signal),
    ]);
    const activityList: Activity[] = [];
    for (const tx of bitcoinTransactions) {
      const txActivity = mapBitcoinTxToActivity(tx, account);
      if (txActivity) {
        activityList.push(await applyMarketData(txActivity));
      }
    }
    return activityList.sort(sortActivityByTimestampDesc);
  }

  async function getStacksActivity(account: AccountAddresses, signal?: AbortSignal) {
    if (!hasStacksAddress(account)) return [];

    const [pendingTxs, txs, txEvents] = await Promise.all([
      stacksTransactionsService.getPendingTransactions(account.stacks.stxAddress, signal),
      hiroStacksApiClient.getAddressTransactions(account.stacks.stxAddress, { pages: 2 }, signal),
      hiroStacksApiClient.getTransactionEvents(account.stacks.stxAddress, { pages: 2 }, signal),
    ]);
    const eventsByTxId = getEventsByTxId(txEvents);
    const activityList: Activity[] = [];
    for (const tx of [...pendingTxs, ...txs.map(tx => tx.tx)]) {
      const txActivity = await getStacksTxActivity(tx, eventsByTxId.get(tx.tx_id), account);
      if (txActivity) {
        activityList.push(
          ...(await Promise.all(txActivity.map(activity => applyMarketData(activity, signal))))
        );
      }
    }
    return activityList.sort(sortActivityByTimestampDesc);
  }

  async function getStxActivity(
    account: AccountAddresses,
    signal?: AbortSignal
  ): Promise<Activity[]> {
    if (!hasStacksAddress(account)) return [];

    const [pendingTxs, txs, txEvents] = await Promise.all([
      stacksTransactionsService.getPendingTransactions(account.stacks.stxAddress, signal),
      hiroStacksApiClient.getAddressTransactions(account.stacks.stxAddress, { pages: 2 }, signal),
      hiroStacksApiClient.getTransactionEvents(account.stacks.stxAddress, { pages: 2 }, signal),
    ]);
    const stxEventsByTxId = getEventsByTxId(
      txEvents.filter(event => event.event_type === 'stx_asset' || event.event_type === 'stx_lock')
    );
    const activityList: Activity[] = [];
    for (const tx of [
      ...pendingTxs,
      ...txs.filter(tx => stxEventsByTxId.has(tx.tx.tx_id)).map(tx => tx.tx),
    ]) {
      const txActivity = await getStacksTxActivity(tx, stxEventsByTxId.get(tx.tx_id), account);
      if (txActivity) {
        activityList.push(
          ...(await Promise.all(txActivity.map(activity => applyMarketData(activity, signal))))
        );
      }
    }
    return activityList.sort(sortActivityByTimestampDesc);
  }

  async function getSip10Activity(
    asset: Sip10CryptoAssetInfo,
    account: AccountAddresses,
    signal?: AbortSignal
  ): Promise<Activity[]> {
    if (!hasStacksAddress(account)) return [];

    const [pendingTxs, txs, txEvents] = await Promise.all([
      stacksTransactionsService.getPendingTransactions(account.stacks.stxAddress, signal),
      hiroStacksApiClient.getAddressTransactions(account.stacks.stxAddress, { pages: 2 }, signal),
      hiroStacksApiClient.getTransactionEvents(account.stacks.stxAddress, { pages: 2 }, signal),
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
      const txActivity = await getStacksTxActivity(tx, eventsByTxId.get(tx.tx_id), account);
      if (txActivity) {
        activityList.push(
          ...(await Promise.all(txActivity.map(activity => applyMarketData(activity, signal))))
        );
      }
    }
    return activityList.sort(sortActivityByTimestampDesc);
  }

  async function getStacksTxActivity(
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
          await getStacksAssetTransfersWithInfo(tx, txEvents, signal)
        );
      case 'contract_call':
        return mapContractCallActivity(
          tx,
          account,
          await getStacksAssetTransfersWithInfo(tx, txEvents, signal)
        );
      default:
        return [];
    }
  }

  async function getStacksAssetTransfersWithInfo(
    tx: HiroStacksTransaction | HiroStacksMempoolTransaction,
    txEvents: HiroTransactionEvent[],
    signal?: AbortSignal
  ): Promise<StacksAssetTransferWithInfo[]> {
    const transfers = getStacksAssetTransfers(tx, txEvents);
    return (await Promise.all(transfers.map(t => addStacksTransferAssetInfo(t, signal)))).filter(
      isDefined
    );
  }

  async function addStacksTransferAssetInfo(
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
              ? await sip10AssetService.getAssetInfo(transfer.assetId, signal)
              : await sip9AssetService.getAssetInfo(transfer.assetId, transfer.tokenValue!, signal),
        };
      } catch {
        // if we're unable to find asset metadata, remove transfer
        return undefined;
      }
    }
  }

  async function applyMarketData(activity: Activity, signal?: AbortSignal) {
    if (
      activity.type === OnChainActivityTypes.sendAsset ||
      activity.type === OnChainActivityTypes.receiveAsset
    ) {
      const isTransferAssetFungible = activity.asset.category === CryptoAssetCategories.fungible;
      if (isTransferAssetFungible) {
        const assetMarketData = await marketDataService.getMarketData(activity.asset, signal);
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
        const fromAssetMarketData = await marketDataService.getMarketData(
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
        const toAssetMarketData = await marketDataService.getMarketData(activity.toAsset, signal);
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

  return {
    getTotalActivity,
    getAccountActivity,
    getActivityByAsset,
    getStacksActivity,
    getStxActivity,
    getBtcActivity,
    getSip10Activity,
  };
}
