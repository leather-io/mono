import type { BlockchainActivityIndicator } from '@leather.io/features';
import { assertUnreachable } from '@leather.io/utils';

import { CancelledIcon } from '../../icons/activity/cancelled-icon.native';
import { FailedIcon } from '../../icons/activity/failed-icon.native';
import { FunctionActivityIcon } from '../../icons/activity/function-icon.native';
import { PendingIcon } from '../../icons/activity/pending-icon.native';
import { ReceivedIcon } from '../../icons/activity/received-icon.native';
import { SentIcon } from '../../icons/activity/sent-icon.native';
import { SwapIcon } from '../../icons/activity/swap-icon.native';

interface BlockchainActivityIndicatorIconProps {
  indicator: BlockchainActivityIndicator;
  size: number;
}

export function BlockchainActivityIndicatorIcon({
  indicator,
  size,
}: BlockchainActivityIndicatorIconProps) {
  switch (indicator) {
    case 'pending':
      return <PendingIcon width={size} height={size} />;
    case 'failed':
      return <FailedIcon width={size} height={size} />;
    case 'cancelled':
      return <CancelledIcon width={size} height={size} />;
    case 'received':
      return <ReceivedIcon width={size} height={size} />;
    case 'swap':
      return <SwapIcon width={size} height={size} />;
    case 'function':
      return <FunctionActivityIcon width={size} height={size} />;
    case 'sent':
      return <SentIcon width={size} height={size} />;
    default:
      return assertUnreachable(indicator);
  }
}
