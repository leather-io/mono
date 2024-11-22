import React from 'react';
import { View } from 'react-native';

import { useTheme } from '@shopify/restyle';
import { activityIconMap } from 'src/icons/activity-icons/activity-icons';
import { Theme } from 'src/theme-native';

import { Icon } from '../icon/icon.native';
import { ActivityIconType } from './types.shared';

interface Props {
  activity: ActivityIconType;
}

export function ActivityIcon({ activity }: Props) {
  const theme = useTheme<Theme>();
  const Component = activityIconMap[activity];
  return (
    <View
      style={{
        position: 'absolute',
        bottom: -4,
        right: -6,
        height: 24,
        width: 24,
        backgroundColor: theme.colors['ink.text-primary'],
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
