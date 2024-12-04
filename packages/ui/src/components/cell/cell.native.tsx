import { ElementRef, forwardRef } from 'react';
import { useAnimatedStyle, withSpring } from 'react-native-reanimated';

import { useTheme } from '@shopify/restyle';

import { usePressedState } from '../../hooks/use-pressed-state.native';
import { Theme } from '../../theme-native';
import { Box, BoxProps } from '../box/box.native';
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

type CellElement = ElementRef<typeof Pressable>;
export type CellProps = PressableRootProps | NonPressableRootProps;

const cellRootStyles: BoxProps = {
  flexDirection: 'row',
  gap: '3',
  px: '5',
  py: '3',
  alignItems: 'center',
};

export const CellRoot = forwardRef<CellElement, CellProps>((props, ref) => {
  const { pressed, onPressIn, onPressOut } = usePressedState();
  const theme = useTheme<Theme>();

  const animatedStyle = useAnimatedStyle(() => {
    return {
      backgroundColor: withSpring(
        pressed ? theme.colors['ink.background-secondary'] : theme.colors['ink.background-primary']
      ),
    };
  });

  if (props.pressable) {
    return (
      <Pressable
        ref={ref}
        {...cellRootStyles}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        style={animatedStyle}
        {...props}
      />
    );
  }

  return <Box ref={ref} {...cellRootStyles} {...props} />;
});

export const Cell = {
  Root: CellRoot,
  Label: CellLabelNative,
  Icon: CellIcon,
  Content: CellContent,
  Aside: CellAsideNative,
};
