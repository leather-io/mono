import { Box } from '../box/box.native';
import {
  Pressable,
  PressableProps,
  legacyTouchablePressEffect,
} from '../pressable/pressable.native';

export interface RadioButtonProps extends PressableProps {
  isSelected: boolean;
}
export function RadioButton({ isSelected, ...props }: RadioButtonProps) {
  return (
    <Pressable {...props} pressEffects={legacyTouchablePressEffect} role="radio">
      <Box
        alignItems="center"
        borderRadius="round"
        borderColor="ink.border-default"
        borderWidth={1}
        backgroundColor="ink.background-primary"
        height={20}
        justifyContent="center"
        width={20}
      >
        <Box
          backgroundColor={isSelected ? 'ink.text-primary' : 'ink.background-primary'}
          borderRadius="round"
          height={10}
          width={10}
        />
      </Box>
    </Pressable>
  );
}
