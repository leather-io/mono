import { ScrollView } from 'react-native-gesture-handler';

import { ActivityCard } from '@/components/widgets/activity/components/activity-card';
import { Widget } from '@/components/widgets/components/widget';
import { t } from '@lingui/macro';
import { useTheme } from '@shopify/restyle';

import { Activity } from '@leather.io/models';
import { Box, Theme } from '@leather.io/ui/native';

// FIXME LEA-2310: temporary hard cap for widget view pending performance improvements
const temporaryMaxItemCap = 5;

interface ActivityWidgetProps {
  activity: Activity[];
  isLoading: boolean;
  onPressHeader: () => void;
}

export function ActivityWidget({ activity, isLoading, onPressHeader }: ActivityWidgetProps) {
  const theme = useTheme<Theme>();

  const hasActivity = activity && activity.length > 0;
  // TODO LEA-1726: handle  loading & error states
  if (isLoading || !hasActivity) return null;

  return (
    <Widget>
      <Box>
        <Widget.Header onPress={onPressHeader}>
          <Widget.Title title={t({ id: 'activity.widget.header_title', message: 'My activity' })} />
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
          {activity.slice(0, temporaryMaxItemCap).map((activity, index) => (
            <ActivityCard key={`activity.${index}`} activity={activity} />
          ))}
        </ScrollView>
      </Widget.Body>
    </Widget>
  );
}
