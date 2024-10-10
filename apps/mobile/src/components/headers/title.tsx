import { Text } from '@leather.io/ui/native';

export function TitleHeader({ title, testID }: { title: string; testID?: string }) {
  return (
    <Text variant="heading05" color="ink.text-primary" testID={testID}>
      {title}
    </Text>
  );
}
