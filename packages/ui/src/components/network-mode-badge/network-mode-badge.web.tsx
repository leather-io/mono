import { Flex } from 'leather-styles/jsx';

import { Badge } from '../badge/badge.web';

interface NetworkBadge {
  isTestnetChain: boolean;
  name: string;
}

export function NetworkModeBadge({ isTestnetChain, name }: NetworkBadge) {
  if (!isTestnetChain) return null;

  return (
    <Flex position="relative" zIndex={999}>
      <Badge label={name} outlined />
    </Flex>
  );
}
