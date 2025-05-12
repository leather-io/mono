import { t } from '@lingui/macro';
import dayjs from 'dayjs';

import { BaseOnChainActivity, OnChainActivity } from '@leather.io/models';

interface FormatActivityStatusProps {
  type: OnChainActivity['type'];
  status: BaseOnChainActivity['status'];
}

export function formatActivityStatus({ type, status }: FormatActivityStatusProps) {
  switch (true) {
    case type === 'sendAsset' && status === 'success':
      return t({
        id: 'activity.status.sent',
        message: 'Sent',
      });
    case type === 'sendAsset' && status === 'failed':
      return t({
        id: 'activity.status.send-failed',
        message: 'Send Failed',
      });
    case type === 'sendAsset' && status === 'pending':
      return t({
        id: 'activity.status.sending',
        message: 'Sending',
      });
    case type === 'receiveAsset' && status === 'success':
      return t({
        id: 'activity.status.received',
        message: 'Received',
      });
    case type === 'receiveAsset' && status === 'failed':
      return t({
        id: 'activity.status.receive-failed',
        message: 'Receive fail',
      });
    case type === 'executeSmartContract' && status === 'success':
      return t({
        id: 'activity.status.executed',
        message: 'Executed',
      });
    case type === 'executeSmartContract' && status === 'pending':
      return t({
        id: 'activity.status.executing',
        message: 'Executing',
      });
    case type === 'executeSmartContract' && status === 'failed':
      return t({
        id: 'activity.status.execute-failed',
        message: 'Execution failed',
      });
    case type === 'deploySmartContract' && status === 'success':
      return t({
        id: 'activity.status.deployed',
        message: 'Deployed',
      });
    case type === 'deploySmartContract' && status === 'pending':
      return t({
        id: 'activity.status.deploying',
        message: 'Deploying',
      });
    case type === 'deploySmartContract' && status === 'failed':
      return t({
        id: 'activity.status.deploy-failed',
        message: 'Deployment failed',
      });
    default:
      return undefined;
  }
}

interface FormatActivityCaptionProps {
  type: OnChainActivity['type'];
  status: BaseOnChainActivity['status'];
  timestamp: number;
}

export function formatActivityCaption({ type, status, timestamp }: FormatActivityCaptionProps) {
  const isRecent = dayjs(timestamp).isAfter(dayjs().subtract(1, 'hour'));
  const time = dayjs(timestamp * 1000).format('MMM D, YYYY');

  const timestampText = isRecent
    ? `${dayjs().diff(dayjs(timestamp * 1000), 'minute')} ${t({
        id: 'activity.time.minutes-ago',
        message: 'minutes ago',
      })}`
    : time;

  const statusText = formatActivityStatus({ type, status });
  return statusText ? `${statusText} ${timestampText}` : timestampText;
}

export function getActivityTitle(activity: OnChainActivity) {
  switch (activity.type) {
    case 'sendAsset':
    case 'receiveAsset':
      if (!activity.value?.crypto?.symbol) {
        // TODO ENG-37 - find out about sBTC rewards - Asked design
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
