import { Text } from '../../../../native';
import { CollectibleCard } from './collectible-card.native';

interface CollectibleTextProps {
  src: string;
  height?: number;
}

export function CollectibleText({ src, height = 200 }: CollectibleTextProps) {
  return (
    <CollectibleCard bg="ink.text-primary" height={height}>
      <Text color="ink.background-secondary" variant="code" p="4">
        {src}
      </Text>
    </CollectibleCard>
  );
}
