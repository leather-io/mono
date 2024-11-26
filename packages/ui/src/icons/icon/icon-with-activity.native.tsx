import { View } from 'react-native';

import { ActivityIcon } from '../activity-icons/activity-icon.native';
import { ActivityIconType } from '../index.native';

export function IconWithActivity({
  avatar,
  activity,
}: {
  avatar: React.JSX.Element;
  activity?: ActivityIconType;
}) {
  return (
    <View style={{ position: 'relative' }}>
      {avatar}
      {activity && <ActivityIcon activity={activity} />}
    </View>
  );
}
