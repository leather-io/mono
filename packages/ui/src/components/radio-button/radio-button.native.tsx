import { Theme } from '../../theme-native';
import { Box } from '../box/box.native';
import { TouchableOpacity, TouchableOpacityProps } from '../button/touchable-opacity.native';

export interface RadioButtonProps extends TouchableOpacityProps<Theme> {
  isSelected: boolean;
}
export function RadioButton({ isSelected, ...props }: RadioButtonProps) {
  return (
    <TouchableOpacity {...props}>
      <Box
        alignItems="center"
        borderRadius="round"
        borderColor="ink.text-primary"
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
    </TouchableOpacity>
  );
}
