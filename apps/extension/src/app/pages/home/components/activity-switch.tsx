import { ActivityList } from '@app/features/activity-list/activity-list';
import { ActivityListLegacy } from '@app/features/activity-list/activity-list-legacy';
import { useFlags } from '@app/features/feature-flags';

export function ActivitySwitch() {
  const { extensionRevamp } = useFlags();
  return extensionRevamp ? <ActivityList /> : <ActivityListLegacy />;
}
