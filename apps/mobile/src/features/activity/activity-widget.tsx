import { ScrollView } from 'react-native-gesture-handler';

import { FetchState, FetchWrapper } from '@/components/loading';
import { Widget } from '@/components/widget';
import { useTheme } from '@shopify/restyle';

import { Activity } from '@leather.io/models';
import { Box, Theme } from '@leather.io/ui/native';

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
  const theme = useTheme<Theme>();
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
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{
            gap: theme.spacing['2'],
            paddingHorizontal: theme.spacing['5'],
          }}
          style={{
            // prevent card shadows being cut off
            overflow: 'visible',
          }}
        >
          <FetchWrapper data={activity}>
            {hasActivity(activity) ? (
              activity.state === 'success' && (
                <ActivityList activity={activity.value} mode="widget" />
              )
            ) : (
              <ActivityEmpty />
            )}
          </FetchWrapper>
        </ScrollView>
      </Widget.Body>
    </Widget>
  );
}
