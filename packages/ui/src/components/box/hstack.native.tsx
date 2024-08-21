import { createBox } from '@shopify/restyle';

import { type Theme } from '../../theme-native';

export const HStack = createBox<Theme>();

HStack.defaultProps = {
  flex: 1,
  flexDirection: 'row',
  alignItems: 'center',
};
