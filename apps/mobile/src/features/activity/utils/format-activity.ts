import { t } from '@lingui/core/macro';
import dayjs from 'dayjs';

import { BaseOnChainActivity, OnChainActivity } from '@leather.io/models';

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
      success: t`Sent`,
      failed: t`Send Failed`,
      pending: t`Sending`,
    },
    receiveAsset: {
      success: t`Received`,
      pending: '', // there is no pending status for receiveAsset
      failed: t`Receive fail`,
    },
    executeSmartContract: {
      success: t`Executed`,
      pending: t`Executing`,
      failed: t`Execution failed`,
    },
    deploySmartContract: {
      success: t`Deployed`,
      pending: t`Deploying`,
      failed: t`Deployment failed`,
    },
    // TODO: ENG-37 - ask for designs for lockAsset and swapAssets statuses
    lockAsset: {
      success: t`Locked`,
      pending: t`Locking`,
      failed: t`Lock failed`,
    },
    swapAssets: {
      success: t`Swapped`,
      pending: t`Swapping`,
      failed: t`Swap failed`,
    },
  };
}

export function getActivityStatusLabel({ type, status }: getActivityStatusLabelProps) {
  const activityStatusMap = getActivityStatusMap();
  return activityStatusMap[type][status];
}

interface FormatActivityCaptionProps {
  type: OnChainActivity['type'];
  status: BaseOnChainActivity['status'];
  timestamp: number;
}

export function formatActivityCaption({ type, status, timestamp }: FormatActivityCaptionProps) {
  const timestampInSeconds = timestamp * 1000;
  const isRecent = dayjs(timestampInSeconds).isAfter(dayjs().subtract(1, 'hour'));
  const time = dayjs(timestampInSeconds).format('MMM D, YYYY');

  const timestampText = isRecent
    ? `${dayjs().diff(dayjs(timestampInSeconds), 'minute')} ${t`minutes ago`}`
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
        // we can have type `sendAsset` / `receiveAsset` with an empty symbol/ unknown token
        // e.g. assetId 'SM1793C4R5PZ4NS4VQ4WMP7SKKYVH8JZEWSZ9HCCR.xyk-pool-sbtc-stx-v-1-1::pool-token'
        // could be an API issue / need to format as sBTC. extension says 'Token transfer'
        return t`Token Transfer`;
      }
      return activity.value?.crypto?.symbol;
    case 'deploySmartContract':
    case 'executeSmartContract':
      return activity.contractId.split('.').pop() || t`Unknown`;
    case 'swapAssets':
      return t`Swap Assets`;
    case 'lockAsset':
      return t`Lock Asset`;
    default:
      return t`Unknown`;
  }
}
