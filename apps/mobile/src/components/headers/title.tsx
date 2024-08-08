import { Text } from '@leather.io/ui/native';

export function TitleHeader({ title }: { title: string }) {
  return (
    <Text variant="heading05" color="ink.text-primary">
      {title}
    </Text>
  );
}
