import { i18n } from '@lingui/core';
import { t } from '@lingui/macro';
import dayjs from 'dayjs';

import { BaseOnChainActivity, OnChainActivity } from '@leather.io/models';

interface getActivityStatusLabelProps {
  type: OnChainActivity['type'];
  status: BaseOnChainActivity['status'];
}

type ActivityStatusMap = Record<
  OnChainActivity['type'],
  Record<BaseOnChainActivity['status'], string>
>;
const activityStatusMap: ActivityStatusMap = {
  sendAsset: {
    success: i18n._({ id: 'activity.status.sent', message: 'Sent' }),
    failed: i18n._({ id: 'activity.status.send-failed', message: 'Send Failed' }),
    pending: i18n._({ id: 'activity.status.sending', message: 'Sending' }),
  },
  receiveAsset: {
    success: i18n._({ id: 'activity.status.received', message: 'Received' }),
    pending: '', // there is no pending status for receiveAsset
    failed: i18n._({ id: 'activity.status.receive-failed', message: 'Receive fail' }),
  },
  executeSmartContract: {
    success: i18n._({ id: 'activity.status.executed', message: 'Executed' }),
    pending: i18n._({ id: 'activity.status.executing', message: 'Executing' }),
    failed: i18n._({ id: 'activity.status.execute-failed', message: 'Execution failed' }),
  },
  deploySmartContract: {
    success: i18n._({ id: 'activity.status.deployed', message: 'Deployed' }),
    pending: i18n._({ id: 'activity.status.deploying', message: 'Deploying' }),
    failed: i18n._({ id: 'activity.status.deploy-failed', message: 'Deployment failed' }),
  },
  // TODO: ENG-37 - ask for designs for lockAsset and swapAssets statuses
  lockAsset: {
    success: i18n._({ id: 'activity.status.locked', message: 'Locked' }),
    pending: i18n._({ id: 'activity.status.locking', message: 'Locking' }),
    failed: i18n._({ id: 'activity.status.lock-failed', message: 'Lock failed' }),
  },
  swapAssets: {
    success: i18n._({ id: 'activity.status.swapped', message: 'Swapped' }),
    pending: i18n._({ id: 'activity.status.swapping', message: 'Swapping' }),
    failed: i18n._({ id: 'activity.status.swap-failed', message: 'Swap failed' }),
  },
};
export function getActivityStatusLabel({ type, status }: getActivityStatusLabelProps) {
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
    ? `${dayjs().diff(dayjs(timestampInSeconds), 'minute')} ${t({
        id: 'activity.time.minutes-ago',
        message: 'minutes ago',
      })}`
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
        return t({
          id: 'activity.type.token-transfer',
          message: 'Token Transfer',
        });
      }
      return activity.value?.crypto?.symbol;
    case 'deploySmartContract':
    case 'executeSmartContract':
      return (
        activity.contractId.split('.').pop() ||
        t({
          id: 'activity.type.unknown',
          message: 'Unknown',
        })
      );
    case 'swapAssets':
      return t({
        id: 'activity.type.swapAssets',
        message: 'Swap Assets',
      });
    case 'lockAsset':
      return t({
        id: 'activity.type.lockAsset',
        message: 'Lock Asset',
      });
    default:
      return t({
        id: 'activity.type.unknown',
        message: 'Unknown',
      });
  }
}
