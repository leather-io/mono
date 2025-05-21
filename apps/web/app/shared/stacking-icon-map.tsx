import { ReactNode } from 'react';
import { BoxedCatLockedIcon, MagnifyingGlassIcon, StacksIcon } from '@leather.io/ui';
import { IconMapType } from '~/shared/types';
import { StackingConditionItem } from '~/features/stacking/components/stacking-conditions';

/**
 * Shared icon map for stacking-related components.
 * Maps icon keys to their ReactNode representations.
 */
export const stackingIconMap: IconMapType = {
  BoxedCatLockedIcon: <BoxedCatLockedIcon />,
  MagnifyingGlassIcon: <MagnifyingGlassIcon />,
  StacksIcon: <StacksIcon />,
};

/**
 * Type for raw condition data before icon mapping
 */
export interface RawConditionItem {
  iconKey: string;
  title: string;
  description: string;
}

/**
 * Utility function to map conditions with icon keys to StackingConditionItem with rendered icons
 */
export function mapConditionsWithIcons(
  conditions: readonly RawConditionItem[]
): StackingConditionItem[] {
  return conditions.map(condition => ({
    icon: stackingIconMap[condition.iconKey] || null,
    title: condition.title,
    description: condition.description
  }));
} 