import { t } from '@lingui/macro';
import dayjs from 'dayjs';

import { Activity, ActivityType, BaseOnChainActivity } from '@leather.io/models';

interface FormatActivityStatusProps {
  activityType: ActivityType;
  status: BaseOnChainActivity['status'];
}

export function formatActivityStatus({ activityType, status }: FormatActivityStatusProps) {
  switch (true) {
    case activityType === 'sendAsset' && status === 'success':
      return t({
        id: 'activity.status.sent',
        message: 'Sent',
      });
    case activityType === 'sendAsset' && status === 'failed':
      return t({
        id: 'activity.status.send-failed',
        message: 'Send Failed',
      });
    case activityType === 'sendAsset' && status === 'pending':
      return t({
        id: 'activity.status.sending',
        message: 'Sending',
      });
    case activityType === 'receiveAsset' && status === 'success':
      return t({
        id: 'activity.status.received',
        message: 'Received',
      });
    case activityType === 'receiveAsset' && status === 'failed':
      return t({
        id: 'activity.status.receive-failed',
        message: 'Receive fail',
      });
    case activityType === 'executeSmartContract' && status === 'success':
      return t({
        id: 'activity.status.executed',
        message: 'Executed',
      });
    case activityType === 'executeSmartContract' && status === 'pending':
      return t({
        id: 'activity.status.executing',
        message: 'Executing',
      });
    case activityType === 'executeSmartContract' && status === 'failed':
      return t({
        id: 'activity.status.execute-failed',
        message: 'Execution failed',
      });
    case activityType === 'deploySmartContract' && status === 'success':
      return t({
        id: 'activity.status.deployed',
        message: 'Deployed',
      });
    case activityType === 'deploySmartContract' && status === 'pending':
      return t({
        id: 'activity.status.deploying',
        message: 'Deploying',
      });
    case activityType === 'deploySmartContract' && status === 'failed':
      return t({
        id: 'activity.status.deploy-failed',
        message: 'Deployment failed',
      });
    default:
      return undefined;
  }
}

interface FormatActivityCaptionProps {
  activityType: ActivityType;
  status: BaseOnChainActivity['status'];
  timestamp: number;
}

export function formatActivityCaption({
  activityType,
  status,
  timestamp,
}: FormatActivityCaptionProps) {
  const isRecent = dayjs(timestamp).isAfter(dayjs().subtract(1, 'hour'));
  const time = dayjs(timestamp * 1000).format('MMM D, YYYY');

  const timestampText = isRecent
    ? `${dayjs().diff(dayjs(timestamp * 1000), 'minute')} ${t({
        id: 'activity.time.minutes-ago',
        message: 'minutes ago',
      })}`
    : time;

  const statusText = formatActivityStatus({ activityType, status });
  return statusText ? `${statusText} ${timestampText}` : timestampText;
}

export function getActivityTitle(activity: Activity) {
  switch (activity.type) {
    case 'sendAsset':
    case 'receiveAsset':
      if (!activity.value?.crypto?.symbol) {
        // TODO LEA-2473 - find out about sBTC rewards
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
      return activity.contractId.split('.').pop() || 'Unknown';
    case 'swapAssets':
      return t({
        id: 'activity.type.swapAssets',
        message: 'Swap Assets',
      });
    case 'connectApp':
    case 'signMessage':
    case 'walletAdded':
    case 'receiveAnnouncement':
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
