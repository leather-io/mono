import { ScrollView } from 'react-native-gesture-handler';

import { FetchState } from '@/components/loading';
import { Widget } from '@/components/widget';
import { ActivityCard } from '@/features/activity/activity-card';
import { useTheme } from '@shopify/restyle';

import { Activity, OnChainActivity, OnChainActivityTypes } from '@leather.io/models';
import { Box, Theme } from '@leather.io/ui/native';

const renderLimit = 10;

function hasActivity(activity: FetchState<Activity[]>) {
  return activity.state === 'success' && activity.value.length > 0;
}

function inOnChainActivity(activity: Activity): activity is OnChainActivity {
  return activity.type in OnChainActivityTypes;
}

function getVisibleActivity(activity: Activity[]) {
  return activity.slice(0, renderLimit).filter(inOnChainActivity);
}

interface ActivityWidgetProps {
  activity: FetchState<Activity[]>;
  onPressHeader?: () => void;
  title: string;
}
export function ActivityWidget({ activity, onPressHeader, title }: ActivityWidgetProps) {
  const theme = useTheme<Theme>();

  if (activity.state !== 'success' || !hasActivity(activity)) {
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
            gap: theme.spacing['3'],
            paddingHorizontal: theme.spacing['5'],
          }}
          style={{
            // prevent card shadows being cut off
            overflow: 'visible',
          }}
        >
          {getVisibleActivity(activity.value).map((activity, index) => (
            <ActivityCard key={`activity.${index}`} activity={activity} />
          ))}
        </ScrollView>
      </Widget.Body>
    </Widget>
  );
}
