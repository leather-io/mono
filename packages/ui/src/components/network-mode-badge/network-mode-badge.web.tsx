import { Flex } from 'leather-styles/jsx';

import { Tag } from '../tag/tag.web';

interface NetworkBadge {
  isTestnetChain: boolean;
  name: string;
}

export function NetworkModeBadge({ isTestnetChain, name }: NetworkBadge) {
  if (!isTestnetChain) return null;

  return (
    <Flex position="relative" zIndex={999}>
      <Tag label={name} transparent />
    </Flex>
  );
}
