import { css } from 'leather-styles/css';

import type { BlockchainActivityIndicator } from '@leather.io/features';
import { assertUnreachable } from '@leather.io/utils';

import { FailedIcon } from '../../icons/activity/failed-icon.web';
import { FunctionActivityIcon } from '../../icons/activity/function-icon.web';
import { ReceivedIcon } from '../../icons/activity/received-icon.web';
import { SentIcon } from '../../icons/activity/sent-icon.web';
import { SwapIcon } from '../../icons/activity/swap-icon.web';

const spinnerClass = css({ animation: 'spin', transformOrigin: 'center' });

interface PendingIndicatorIconProps {
  size: number;
}

// The shared PendingIcon asset is an invisible Figma conic-gradient export, so
// collecting transactions use a spinner badge matching the sent/failed sub-icons:
// a dark disc with a spinning ¾ ring.
export function PendingIndicatorIcon({ size }: PendingIndicatorIconProps) {
  return (
    <svg
      className={spinnerClass}
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect width="16" height="16" rx="8" fill="#12100F" />
      <path
        d="M8 3.5a4.5 4.5 0 1 1-4.5 4.5"
        stroke="#FFFFFF"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

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
      return <PendingIndicatorIcon size={size} />;
    case 'failed':
      return <FailedIcon width={size} height={size} />;
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
