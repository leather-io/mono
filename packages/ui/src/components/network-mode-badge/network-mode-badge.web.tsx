import { Flex, type FlexProps } from 'leather-styles/jsx';

import { Badge } from '../badge/badge.web';

interface NetworkBadge extends FlexProps {
  isVisible: boolean;
  name: string;
}

export function NetworkModeBadge({ isVisible, name, ...props }: NetworkBadge) {
  if (!isVisible) return null;

  return (
    <Flex position="relative" zIndex={999} {...props}>
      <Badge label={name} outlined />
    </Flex>
  );
}
