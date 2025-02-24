import { Flex, FlexProps, styled } from 'leather-styles/jsx';

import { isEven } from '@leather.io/utils';

import { AddressDisplayerBaseProps } from './address-displayer.types.shared';
import { groupByFour } from './address-displayer.utils.shared';

export type AddressDisplayerProps = AddressDisplayerBaseProps & FlexProps;

export function AddressDisplayer({ address, ...props }: AddressDisplayerProps) {
  return (
    <Flex direction="row" columnGap="1ch" flexWrap="wrap" {...props}>
      {groupByFour(address).map((letterGroup, index) => (
        <styled.span
          key={index}
          color={isEven(index) ? 'ink.text-primary' : 'ink.text-subdued'}
          textStyle="address"
        >
          {letterGroup}
        </styled.span>
      ))}
    </Flex>
  );
}
