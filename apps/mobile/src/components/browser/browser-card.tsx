import { Pressable, Text } from '@leather.io/ui/native';

interface BrowserCardProps {
  onPress(): void;
  title: string;
  dAppName: string;
}

export function BrowserCard({ title, dAppName, onPress }: BrowserCardProps) {
  return (
    <Pressable
      onPress={onPress}
      bg="ink.action-primary-default"
      width={256}
      height={256}
      p="3"
      borderRadius="sm"
      justifyContent="space-between"
    >
      <Text variant="heading03" color="ink.background-secondary">
        {title}
      </Text>
      <Text variant="label02" color="ink.background-secondary">
        {dAppName}
      </Text>
    </Pressable>
  );
}
