import { t } from '@lingui/macro';

import { ActivityType } from '@leather.io/models';

export function formatActivityType(activityType: ActivityType) {
  return {
    deploySmartContract: t({
      id: 'activity.type.deploySmartContract',
      message: 'Deploy Smart Contract',
    }),
    executeSmartContract: t({
      id: 'activity.type.executeSmartContract',
      message: 'Execute Smart Contract',
    }),
    lockAsset: t({
      id: 'activity.type.lockAsset',
      message: 'Lock Asset',
    }),
    sendAsset: t({
      id: 'activity.type.sendAsset',
      message: 'Send',
    }),
    receiveAsset: t({
      id: 'activity.type.receiveAsset',
      message: 'Receive',
    }),
    swapAssets: t({
      id: 'activity.type.swapAssets',
      message: 'Swap Assets',
    }),
    connectApp: t({
      id: 'activity.type.connectApp',
      message: 'Connect App',
    }),
    signMessage: t({
      id: 'activity.type.signMessage',
      message: 'Sign Message',
    }),
    walletAdded: t({
      id: 'activity.type.walletAdded',
      message: 'Wallet Added',
    }),
    receiveAnnouncement: t({
      id: 'activity.type.receiveAnnouncement',
      message: 'Announcement',
    }),
    featureWaitlistNotification: t({
      id: 'activity.type.featureWaitlistNotification',
      message: 'Waitlist Notification',
    }),
  }[activityType];
}
