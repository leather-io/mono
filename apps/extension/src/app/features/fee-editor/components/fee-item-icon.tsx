import type { ComponentProps } from 'react';

import {
  AnimalChameleonIcon,
  AnimalEagleIcon,
  AnimalRabbitIcon,
  AnimalSnailIcon,
  Avatar,
} from '@leather.io/ui';

import type { FeePriority } from '../fee-editor.context';

type AvatarIcon = NonNullable<ComponentProps<typeof Avatar>['icon']>;

const feeTypeToIconMap: Record<FeePriority, AvatarIcon> = {
  slow: <AnimalSnailIcon />,
  standard: <AnimalRabbitIcon />,
  fast: <AnimalEagleIcon />,
  custom: <AnimalChameleonIcon />,
};

export function FeeItemIcon({ priority }: { priority: FeePriority }) {
  const icon = feeTypeToIconMap[priority];
  if (!icon) return null;

  return (
    <Avatar
      size="lg"
      bg="ink.component-background-hover"
      outlineColor="ink.component-background-hover"
      icon={icon}
    />
  );
}
