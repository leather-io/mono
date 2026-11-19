import { Flex, type FlexProps } from 'leather-styles/jsx';

import { type HasChildren } from '@app/common/has-children';

export function ButtonRow({ children, ...props }: HasChildren & FlexProps) {
  return (
    <Flex flexDirection="column" gap="space.04" width="100%" {...props}>
      {children}
    </Flex>
  );
}
