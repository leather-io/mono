import { msg } from '@lingui/core/macro';

export function translateActivityStatus(status: string) {
  switch (status) {
    case 'Sent':
      return msg`Sent`;
    case 'Sending':
      return msg`Sending`;
    case 'Send Failed':
      return msg`Send Failed`;
    case 'Received':
      return msg`Received`;
    case 'Receive fail':
      return msg`Receive failed`;
    case 'Executed':
      return msg`Executed`;
    case 'Executing':
      return msg`Executing`;
    case 'Execution failed':
      return msg`Execution failed`;
    case 'Deployed':
      return msg`Deployed`;
    case 'Deploying':
      return msg`Deploying`;
    case 'Deployment failed':
      return msg`Deployment failed`;
    case 'Locked':
      return msg`Locked`;
    case 'Locking':
      return msg`Locking`;
    case 'Lock failed':
      return msg`Lock failed`;
    case 'Swapped':
      return msg`Swapped`;
    case 'Swapping':
      return msg`Swapping`;
    case 'Swap failed':
      return msg`Swap failed`;
    case 'Connected':
      return msg`Connected`;
    case 'Connecting':
      return msg`Connecting`;
    case 'Connection failed':
      return msg`Connection failed`;
    case 'Signed':
      return msg`Signed`;
    case 'Signing':
      return msg`Signing`;
    case 'Signing failed':
      return msg`Signing failed`;
    case 'Wallet added':
      return msg`Wallet added`;
    case 'Adding wallet':
      return msg`Adding wallet`;
    case 'Adding wallet failed':
      return msg`Adding wallet failed`;
    case 'Announcement received':
      return msg`Announcement received`;
    case 'Receiving announcement':
      return msg`Receiving announcement`;
    case 'Receiving announcement failed':
      return msg`Receiving announcement failed`;
    case 'Feature waitlist notification':
      return msg`Feature waitlist notification`;
    case 'Receiving feature waitlist notification':
      return msg`Receiving feature waitlist notification`;
    case 'Receiving feature waitlist notification failed':
      return msg`Receiving feature waitlist notification failed`;
    default:
      return status;
  }
}
