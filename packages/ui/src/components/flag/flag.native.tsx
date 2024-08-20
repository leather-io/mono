import { StyleSheet, View, ViewStyle } from 'react-native';

import type { FlagAlignment } from './flag.types';

export interface FlagProps {
  children: React.ReactNode;
  align?: FlagAlignment;
  img?: React.ReactNode;
  reverse?: boolean;
  viewBoxStyles?: ViewStyle;
}

const getFlagAlignment = (align: FlagAlignment) => {
  switch (align) {
    case 'top':
      return 'flex-start';
    case 'middle':
      return 'center';
    case 'bottom':
      return 'flex-end';
  }
};

export function Flag({
  align = 'middle',
  reverse = false,
  img,
  children,
  viewBoxStyles = {},
}: FlagProps) {
  return (
    <View
      style={[
        styles.container,
        {
          flexDirection: reverse ? 'row-reverse' : 'row',
          alignItems: getFlagAlignment(align),
        },
        viewBoxStyles,
      ]}
    >
      <View style={styles.container}>{img}</View>
      <View style={styles.container}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
