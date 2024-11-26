import React from 'react';
import { View } from 'react-native';

import { useTheme } from '@shopify/restyle';
import { activityIconMap } from 'src/icons/activity-icons/activity-icons';
import { Theme } from 'src/theme-native';

import { Icon } from '../icon/icon.native';
import { ActivityIconType } from './types.shared';

interface ActivityIconProps {
  activity: ActivityIconType;
}

const useBackgroundColor = (activity: ActivityIconType) => {
  const theme = useTheme<Theme>();
  switch (activity) {
    case 'error':
      return theme.colors['red.action-primary-default'];
    default:
      return theme.colors['ink.text-primary'];
  }
};

export function ActivityIcon({ activity }: ActivityIconProps) {
  const theme = useTheme<Theme>();
  const Component = activityIconMap[activity];
  const backgroundColor = useBackgroundColor(activity);
  return (
    <View
      style={{
        position: 'absolute',
        bottom: -4,
        right: -6,
        height: 24,
        width: 24,
        backgroundColor,
        borderColor: theme.colors['ink.background-primary'],
        borderWidth: 3,
        borderRadius: 1000,
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <Icon width={8} height={8} color={theme.colors['ink.background-primary']}>
        <Component />
      </Icon>
    </View>
  );
}
