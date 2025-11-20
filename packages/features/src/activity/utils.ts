import dayjs from 'dayjs';

import {
  type BaseOnChainActivity,
  ChainId,
  CryptoAsset,
  type Money,
  NetworkConfiguration,
  type OnChainActivity,
  isFungibleAsset,
  isInscriptionAsset,
  isStampAsset,
} from '@leather.io/models';
import { FormatAmountOptions, createCurrencyFormatter, minusSign } from '@leather.io/utils';

import { HIRO_EXPLORER_URL, MEMPOOL_BASE_URL } from './constants';
import { type BitcoinNetworkPreference, type StacksNetworkPreference } from './types';

const currencyFormatter = createCurrencyFormatter({
  locale: 'en-US',
});

function formatMoney(money: Money, options?: FormatAmountOptions) {
  return currencyFormatter.formatAmount(
    {
      amount: money.amount.shiftedBy(-money.decimals).toNumber(),
      currencyCode: money.symbol,
      decimals: money.decimals,
    },
    options
  );
}

function addOperator(balance: string, operator?: string) {
  return operator ? `${operator} ${balance}` : balance;
}

function getBalanceOperator(activity: OnChainActivity) {
  if (activity.type === 'receiveAsset') return '+';
  if (activity.type === 'sendAsset') return minusSign;
  return undefined;
}

function getActivityStatusMap(): Record<
  OnChainActivity['type'],
  Record<BaseOnChainActivity['status'], string>
> {
  return {
    sendAsset: {
      success: `Sent`,
      pending: `Sending`,
      failed: `Send Failed`,
    },
    receiveAsset: {
      success: `Received`,
      pending: '', // there is no pending status for receiveAsset
      failed: `Receive fail`,
    },
    executeSmartContract: {
      success: `Executed`,
      pending: `Executing`,
      failed: `Execution failed`,
    },
    deploySmartContract: {
      success: `Deployed`,
      pending: `Deploying`,
      failed: `Deployment failed`,
    },
    // TODO: ENG-37 - ask for designs for lockAsset and swapAssets statuses
    lockAsset: {
      success: `Locked`,
      pending: `Locking`,
      failed: `Lock failed`,
    },
    swapAssets: {
      success: `Swapped`,
      pending: `Swapping`,
      failed: `Swap failed`,
    },
  };
}

export function formatActivityStatusLabel(activity: OnChainActivity) {
  const { type, status } = activity;

  const activityStatusMap = getActivityStatusMap();

  switch (type) {
    case 'deploySmartContract':
    case 'executeSmartContract':
      return activity.contractId.split('.').pop() || `Unknown`;
    case 'swapAssets':
      if (isFungibleAsset(activity.fromAsset) && isFungibleAsset(activity.toAsset)) {
        return `${activity.fromAsset.symbol} → ${activity.toAsset.symbol}`;
      } else if (isStampAsset(activity.fromAsset) && isStampAsset(activity.toAsset)) {
        return `Stamp → Stamp`;
      } else if (isInscriptionAsset(activity.fromAsset) && isInscriptionAsset(activity.toAsset)) {
        return `${activity.fromAsset.title} → ${activity.toAsset.title}`;
      }
      return `${activity.fromAsset.category} → ${activity.toAsset.category}`;
    default:
      return activityStatusMap[type][status];
  }
}

export function formatActivityCaption({
  timestamp,
}: Pick<OnChainActivity, 'timestamp' | 'status' | 'type'>) {
  const timestampInSeconds = timestamp * 1000;
  const isRecent = dayjs(timestampInSeconds).isAfter(dayjs().subtract(1, 'hour'));
  const time = dayjs(timestampInSeconds).format('MMM D, YYYY');

  const timestampText = isRecent
    ? `${dayjs().diff(dayjs(timestampInSeconds), 'minute')} ${`minutes ago`}`
    : time;

  return timestampText;
}

export function getActivityTitle(activity: OnChainActivity) {
  switch (activity.type) {
    case 'sendAsset':
    case 'receiveAsset':
      if (!activity.value?.crypto?.symbol) {
        // TODO LEA-2622 - Add new design for contract execution and sBTC rewards
        // we can have type `sendAsset` / `receiveAsset` with an empty symbol/ unknown token
        // e.g. assetId 'SM1793C4R5PZ4NS4VQ4WMP7SKKYVH8JZEWSZ9HCCR.xyk-pool-sbtc-stx-v-1-1::pool-token'
        // could be an API issue / need to format as sBTC. extension says 'Token transfer'
        return `Token Transfer`;
      }
      return activity.value?.crypto?.symbol;
    case 'deploySmartContract':
    case 'executeSmartContract':
      return activity.contractId.split('.').pop() || `Unknown`;
    case 'swapAssets':
      return `Swap Assets`;
    case 'lockAsset':
      return `Lock Asset`;
    default:
      return `Unknown`;
  }
}

export function getBalancesText(activity: OnChainActivity) {
  if (activity.type === 'swapAssets') {
    const formattedToBalanceCrypto =
      activity.toValue?.crypto && addOperator(formatMoney(activity.toValue?.crypto), '+');
    const formattedToBalanceQuote =
      activity.toValue?.quote && addOperator(formatMoney(activity.toValue?.quote), '+');

    return {
      formattedBalanceCrypto: formattedToBalanceCrypto,
      formattedBalanceQuote: formattedToBalanceQuote,
    };
  }

  if (!('value' in activity))
    return {
      formattedBalanceCrypto: '',
      formattedBalanceQuote: '',
    };
  const formattedBalanceCrypto =
    activity.value?.crypto &&
    addOperator(formatMoney(activity.value?.crypto), getBalanceOperator(activity));
  const formattedBalanceQuote =
    activity.value?.quote &&
    addOperator(formatMoney(activity.value?.quote), getBalanceOperator(activity));

  return {
    formattedBalanceCrypto,
    formattedBalanceQuote,
  };
}

interface MakeActivityArgs {
  txid: string;
  networkPreference: NetworkConfiguration;
  asset?: CryptoAsset;
}
export function makeActivityLink({ txid, networkPreference, asset }: MakeActivityArgs) {
  if (txid && asset) {
    return makeActivityExplorerLink({
      asset,
      txid,
      networkPreference,
    });
  }
  return null;
}

interface MakeActivityExplorerLinkArgs {
  asset: CryptoAsset;
  txid: string;
  networkPreference: NetworkConfiguration;
}
function makeActivityExplorerLink({
  asset,
  txid,
  networkPreference,
}: MakeActivityExplorerLinkArgs) {
  if (asset.chain === 'bitcoin') {
    return getMempoolExplorerLink({
      networkPreference: networkPreference.chain.bitcoin.bitcoinNetwork as BitcoinNetworkPreference,
      id: txid,
      type: 'txid',
    });
  }
  return makeStacksTxExplorerLink({
    networkPreference:
      networkPreference.chain.stacks.chainId === ChainId.Testnet ? 'testnet' : 'mainnet',
    searchParams: undefined,
    txid,
    explorerUrl: HIRO_EXPLORER_URL,
  });
}

interface MakeStacksTxExplorerLinkArgs {
  networkPreference: StacksNetworkPreference;
  searchParams?: URLSearchParams;
  txid: string;
  explorerUrl: string;
}
function makeStacksTxExplorerLink({
  networkPreference,
  searchParams = new URLSearchParams(),
  txid,
  explorerUrl,
}: MakeStacksTxExplorerLinkArgs) {
  searchParams.append('chain', networkPreference);
  return `${explorerUrl}/txid/${txid}?${searchParams.toString()}`;
}

export interface GetMempoolExplorerLinkArgs {
  id: string;
  type: 'txid' | 'block';
  networkPreference: BitcoinNetworkPreference;
}

export function getMempoolExplorerLink({
  id,
  type,
  networkPreference,
}: GetMempoolExplorerLinkArgs) {
  switch (networkPreference) {
    case 'mainnet':
      return `${MEMPOOL_BASE_URL}/${type}/${id}`;
    case 'testnet4':
      return `${MEMPOOL_BASE_URL}/testnet4/${type}/${id}`;
    case 'signet':
      return `${MEMPOOL_BASE_URL}/signet/${type}/${id}`;
    default:
      return null;
  }
}
