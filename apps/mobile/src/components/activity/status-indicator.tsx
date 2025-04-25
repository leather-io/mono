import { SpinnerIcon } from '@/components/spinner-icon';

import { ActivityType, OnChainActivityStatus } from '@leather.io/models';
import { ArrowDownIcon, ArrowUpIcon, CheckmarkCircleIcon } from '@leather.io/ui/native';

interface StatusIndicatorProps {
  type: ActivityType;
  status?: OnChainActivityStatus;
}
export function StatusIndicator({ type, status }: StatusIndicatorProps): JSX.Element | null {
  switch (status) {
    case 'pending':
      return <SpinnerIcon width={16} height={16} />;
    case 'success':
      if (type == 'sendAsset') {
        return <ArrowUpIcon width={16} height={16} />;
      } else {
        return <ArrowDownIcon width={16} height={16} />;
      }
    case 'failed':
      return <CheckmarkCircleIcon width={16} height={16} />;
    case undefined:
    default:
      return null;
  }
}
