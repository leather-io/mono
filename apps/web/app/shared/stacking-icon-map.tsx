import { StackingConditionItem } from '~/features/stacking/components/stacking-conditions';
import { IconMapType } from '~/shared/post-types';

import { BoxedCatLockedIcon, MagnifyingGlassIcon, StacksIcon } from '@leather.io/ui';

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
interface RawConditionItem {
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
    description: condition.description,
  }));
}
