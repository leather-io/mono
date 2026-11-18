import type { ReactNode } from 'react';

import {
  AnimalChameleonIcon,
  AnimalEagleIcon,
  AnimalRabbitIcon,
  AnimalSnailIcon,
  CoinsStackIcon,
} from '@leather.io/ui';

import type { ApprovalFeeSpeed } from './approval-direction';

const feeSpeedIconSize = 20;

const feeSpeedIcons: Record<ApprovalFeeSpeed, typeof AnimalRabbitIcon> = {
  slow: AnimalSnailIcon,
  standard: AnimalRabbitIcon,
  fast: AnimalEagleIcon,
  custom: AnimalChameleonIcon,
};

interface ApprovalFeeIconProps {
  icon?: ReactNode;
  speed?: ApprovalFeeSpeed;
  size?: number;
}

export function ApprovalFeeIcon({ icon, speed, size }: ApprovalFeeIconProps) {
  if (icon) return icon;
  if (!speed) {
    return <CoinsStackIcon variant="small" color="ink.text-subdued" width={size} height={size} />;
  }
  const SpeedIcon = feeSpeedIcons[speed];
  return (
    <SpeedIcon
      color="ink.text-primary"
      width={size ?? feeSpeedIconSize}
      height={size ?? feeSpeedIconSize}
      aria-hidden
    />
  );
}
