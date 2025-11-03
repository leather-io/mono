import dayjs from 'dayjs';
import { formatCurrency } from '~/utils/currency-formatter';

import type { BaseOnChainActivity, OnChainActivity } from '@leather.io/models';
import { minusSign } from '@leather.io/utils';

function addOperator(balance: string, operator?: string) {
  return operator ? `${operator} ${balance}` : balance;
}

function getBalanceOperator(activity: OnChainActivity) {
  if (activity.type === 'receiveAsset') return '+';
  if (activity.type === 'sendAsset') return minusSign;
  return undefined;
}

export function getBalanceColor(activity: OnChainActivity) {
  if (activity.type === 'receiveAsset' && activity.status === 'success')
    return 'green.action-primary-default';
  return 'ink.text-primary';
}
interface FormatActivityCaptionProps {
  type: OnChainActivity['type'];
  status: BaseOnChainActivity['status'];
  timestamp: number;
}

interface getActivityStatusLabelProps {
  type: OnChainActivity['type'];
  status: BaseOnChainActivity['status'];
}

function getActivityStatusMap(): Record<
  OnChainActivity['type'],
  Record<BaseOnChainActivity['status'], string>
> {
  return {
    sendAsset: {
      success: `Sent`,
      failed: `Send Failed`,
      pending: `Sending`,
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
function getActivityStatusLabel({ type, status }: getActivityStatusLabelProps) {
  const activityStatusMap = getActivityStatusMap();
  return activityStatusMap[type][status];
}

export function formatActivityCaption({ type, status, timestamp }: FormatActivityCaptionProps) {
  const timestampInSeconds = timestamp * 1000;
  const isRecent = dayjs(timestampInSeconds).isAfter(dayjs().subtract(1, 'hour'));
  const time = dayjs(timestampInSeconds).format('MMM D, YYYY');

  const timestampText = isRecent
    ? `${dayjs().diff(dayjs(timestampInSeconds), 'minute')} ${`minutes ago`}`
    : time;

  const statusText = getActivityStatusLabel({ type, status });
  return statusText ? `${statusText} ${timestampText}` : timestampText;
}

export function getActivityTitle(activity: OnChainActivity) {
  switch (activity.type) {
    case 'sendAsset':
    case 'receiveAsset':
      if (!activity.value?.crypto?.symbol) {
        // TODO LEA-2622 - Add new design for contract execution and sBTC rewards
        // we can have type `sendAsse` / `receiveAsset` with an empty symbol/ unknown token
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
      return `Lock Asse`;
    default:
      return `Unknown`;
  }
}

export function getBalancesText(activity: OnChainActivity) {
  if (!('value' in activity))
    return {
      formattedBalanceCrypto: '',
      formattedBalanceQuote: '',
    };
  const formattedBalanceCrypto =
    activity.value?.crypto &&
    addOperator(formatCurrency(activity.value?.crypto, {}), getBalanceOperator(activity));
  const formattedBalanceQuote =
    activity.value?.quote &&
    addOperator(formatCurrency(activity.value?.quote, {}), getBalanceOperator(activity));

  return {
    formattedBalanceCrypto,
    formattedBalanceQuote,
  };
}
