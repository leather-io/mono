import { usePressedState } from '../../hooks/use-pressed-state.native';
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

function CellRoot(props: CellProps & { ref?: PressableRef }) {
  const { onPressIn, onPressOut } = usePressedState();

  if (props.pressable) {
    return (
      <Pressable
        {...cellRootStyles}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        pressEffect={{
          backgroundColor: {
            from: 'ink.background-primary',
            to: 'ink.background-secondary',
            duration: 150,
          },
        }}
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
