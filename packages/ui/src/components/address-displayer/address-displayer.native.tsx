import { isEven } from '@leather.io/utils';

import { Box } from '../box/box.native';
import { Text, type TextProps } from '../text/text.native';
import { type AddressDisplayerBaseProps } from './address-displayer.types.shared';
import { groupByFour } from './address-displayer.utils.shared';

export type AddressDisplayerProps = AddressDisplayerBaseProps & TextProps;

export function AddressDisplayer({ address, ...props }: AddressDisplayerProps) {
  return (
    <Box flexDirection="row" columnGap="2" flexWrap="wrap">
      {groupByFour(address).map((letterGroup, index) => (
        <Text
          key={index}
          variant="address"
          color={isEven(index) ? 'ink.text-primary' : 'ink.text-subdued'}
          {...props}
        >
          {letterGroup}
        </Text>
      ))}
    </Box>
  );
}
