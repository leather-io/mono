import { isEven } from '@leather.io/utils';

import { Box, BoxProps } from '../box/box.native';
import { Text } from '../text/text.native';
import { AddressDisplayerBaseProps } from './address-displayer.types.shared';
import { groupByFour } from './address-displayer.utils.shared';

export type AddressDisplayerProps = AddressDisplayerBaseProps & BoxProps;

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
