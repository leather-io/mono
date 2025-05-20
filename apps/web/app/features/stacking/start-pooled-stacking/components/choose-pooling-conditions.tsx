import { content } from '~/data/content';
import { StackingConditions } from '~/features/stacking/components/stacking-conditions';
import { mapConditionsWithIcons } from '~/shared/stacking-icon-map';

/**
 * Component for choosing pooled stacking conditions
 * Uses shared icon mapping to display condition icons
 */
export function ChoosePoolingConditions() {
  const poolingConditions = mapConditionsWithIcons(content.stackingConditions);
  return <StackingConditions conditions={poolingConditions} />;
}
