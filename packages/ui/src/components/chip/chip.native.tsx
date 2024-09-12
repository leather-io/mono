import { createBox } from '@shopify/restyle';

import { Text } from '../../../native';
import { type Theme } from '../../theme-native';

interface ChipProps {
  label: string | number;
}

export const Chip = createBox<Theme, ChipProps>(({ label, ...rest }) => (
  <Text variant="label02" width="5" height="4" {...rest}>
    {label}
  </Text>
));

//  FIXME double check padding and gap with design
Chip.defaultProps = {
  backgroundColor: 'ink.component-background-default',
  borderRadius: 'xs',
  paddingLeft: '1',
  paddingRight: '1',
  paddingTop: '0', // says 2px in figma but no token for that
  paddingBottom: '0', // says 2px in figma but no token for that
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  gap: '3', // 12px - says 10px in figma but no token for that
};
