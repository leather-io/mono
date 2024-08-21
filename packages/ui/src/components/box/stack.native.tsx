import { createBox } from '@shopify/restyle';

import { type Theme } from '../../theme-native';

export const Stack = createBox<Theme>();

Stack.defaultProps = {
  flex: 1,
  flexDirection: 'column',
  alignItems: 'center',
};
