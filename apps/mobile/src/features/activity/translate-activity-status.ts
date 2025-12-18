import { t } from '@lingui/core/macro';

export function translateActivityStatus(status: string) {
  switch (status) {
    case 'Sent':
      return t`Sent`;
    case 'Sending':
      return t`Sending`;
    case 'Send Failed':
      return t`Send Failed`;
    case 'Received':
      return t`Received`;
    case 'Receive fail':
      return t`Receive failed`;
    case 'Executed':
      return t`Executed`;
    case 'Executing':
      return t`Executing`;
    case 'Execution failed':
      return t`Execution failed`;
    case 'Deployed':
      return t`Deployed`;
    case 'Deploying':
      return t`Deploying`;
    case 'Deployment failed':
      return t`Deployment failed`;
    case 'Locked':
      return t`Locked`;
    case 'Locking':
      return t`Locking`;
    case 'Lock failed':
      return t`Lock failed`;
    case 'Swapped':
      return t`Swapped`;
    case 'Swapping':
      return t`Swapping`;
    case 'Swap failed':
      return t`Swap failed`;
    case 'Connected':
      return t`Connected`;
    case 'Connecting':
      return t`Connecting`;
    case 'Connection failed':
      return t`Connection failed`;
    case 'Signed':
      return t`Signed`;
    case 'Signing':
      return t`Signing`;
    case 'Signing failed':
      return t`Signing failed`;
    case 'Wallet added':
      return t`Wallet added`;
    case 'Adding wallet':
      return t`Adding wallet`;
    case 'Adding wallet failed':
      return t`Adding wallet failed`;
    case 'Announcement received':
      return t`Announcement received`;
    case 'Receiving announcement':
      return t`Receiving announcement`;
    case 'Receiving announcement failed':
      return t`Receiving announcement failed`;
    case 'Feature waitlist notification':
      return t`Feature waitlist notification`;
    case 'Receiving feature waitlist notification':
      return t`Receiving feature waitlist notification`;
    case 'Receiving feature waitlist notification failed':
      return t`Receiving feature waitlist notification failed`;
    default:
      return status;
  }
}
