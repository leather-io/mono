import { ReactNode } from 'react';

import { isString } from '@leather.io/utils';

import { HasChildren } from '../../utils/has-children.shared';
import { Box } from '../box/box.native';
import { TouchableOpacity } from '../button/touchable-opacity.native';
import { Text } from '../text/text.native';

interface NumpadKeyProps {
  label: string;
  element: ReactNode;
  onPress(): void;
  onLongPress?(): void;
}

export function NumpadKey({ element, label, onPress, onLongPress }: NumpadKeyProps) {
  return (
    <TouchableOpacity
      flexDirection="row"
      alignItems="center"
      justifyContent="center"
      height="100%"
      accessibilityLabel={label}
      onPress={onPress}
      onLongPress={onLongPress}
    >
      {isString(element) ? (
        <Text variant="heading04" allowFontScaling={false}>
          {element}
        </Text>
      ) : (
        element
      )}
    </TouchableOpacity>
  );
}

export function NumpadKeySlot({ children }: HasChildren) {
  return (
    <Box height={44} flexGrow={1} flexShrink={1} flexBasis="30%">
      {children}
    </Box>
  );
}
