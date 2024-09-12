import { createBox } from '@shopify/restyle';

import { type Theme } from '../../theme-native';

export const Avatar = createBox<Theme>();

Avatar.defaultProps = {
  bg: 'ink.background-secondary',
  borderRadius: 'round',
  p: '2',
};
