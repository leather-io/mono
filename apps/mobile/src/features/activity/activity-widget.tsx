import { HorizontalScrollView } from '@/components/horizontal-scroll-view';
import { FetchState, FetchWrapper } from '@/components/loading';
import { Widget } from '@/components/widget';

import { Activity } from '@leather.io/models';
import { Box } from '@leather.io/ui/native';

import { ActivityEmpty } from './activity-empty';
import { ActivityList } from './activity-list';

export function hasActivity(activity: FetchState<Activity[]>) {
  return activity.state === 'success' && activity.value.length > 0;
}

interface ActivityWidgetProps {
  activity: FetchState<Activity[]>;
  onPressHeader?: () => void;
  title: string;
}
export function ActivityWidget({ activity, onPressHeader, title }: ActivityWidgetProps) {
  // Don't render anything if loading or no activity
  if (activity.state === 'loading' || !hasActivity(activity)) {
    return null;
  }
  return (
    <Widget>
      <Box>
        <Widget.Header onPress={onPressHeader}>
          <Widget.Title title={title} />
        </Widget.Header>
      </Box>
      <Widget.Body>
        <HorizontalScrollView>
          <FetchWrapper data={activity}>
            {hasActivity(activity) ? (
              activity.state === 'success' && (
                <ActivityList activity={activity.value} mode="widget" />
              )
            ) : (
              <ActivityEmpty />
            )}
          </FetchWrapper>
        </HorizontalScrollView>
      </Widget.Body>
    </Widget>
  );
}
