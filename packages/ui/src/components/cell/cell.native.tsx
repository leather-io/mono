import { useAnimatedStyle, withSpring } from 'react-native-reanimated';

import { useTheme } from '@shopify/restyle';

import { usePressedState } from '../../hooks/use-pressed-state.native';
import { Theme } from '../../theme-native';
import { Box, BoxProps } from '../box/box.native';
import { PressableRef } from '../pressable/pressable-core.native';
import { Pressable, PressableProps } from '../pressable/pressable.native';
import { CellAsideNative } from './components/cell-aside.native';
import { CellContent } from './components/cell-content.native';
import { CellIcon } from './components/cell-icon.native';
import { CellLabelNative } from './components/cell-label.native';

type PressableRootProps = {
  pressable: true;
} & PressableProps;

type NonPressableRootProps = {
  pressable: false;
} & BoxProps;

export type CellProps = PressableRootProps | NonPressableRootProps;

const cellRootStyles: BoxProps = {
  flexDirection: 'row',
  gap: '3',
  px: '5',
  py: '3',
  alignItems: 'center',
};

export function CellRoot({ style, ...props }: CellProps & { ref?: PressableRef }) {
  const { pressed, onPressIn, onPressOut } = usePressedState();
  const theme = useTheme<Theme>();

  const animatedStyle = useAnimatedStyle(() => {
    return {
      backgroundColor: withSpring(
        pressed.value
          ? theme.colors['ink.background-secondary']
          : theme.colors['ink.background-primary']
      ),
    };
  });

  if (props.pressable) {
    return (
      <Pressable
        {...cellRootStyles}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        style={[animatedStyle, style]}
        {...props}
      />
    );
  }

  return <Box {...cellRootStyles} {...props} />;
}

CellRoot.displayName = 'Cell.Root';

export const Cell = {
  Root: CellRoot,
  Label: CellLabelNative,
  Icon: CellIcon,
  Content: CellContent,
  Aside: CellAsideNative,
};
