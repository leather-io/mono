import { Flex } from 'leather-styles/jsx';

import { Badge } from '../badge/badge.web';

interface NetworkBadge {
  isVisible: boolean;
  name: string;
}

export function NetworkModeBadge({ isVisible, name }: NetworkBadge) {
  if (!isVisible) return null;

  return (
    <Flex position="relative" zIndex={999}>
      <Badge label={name} outlined />
    </Flex>
  );
}
