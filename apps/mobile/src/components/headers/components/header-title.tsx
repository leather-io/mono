import { Text } from '@leather.io/ui/native';

interface HeaderTitleProps {
  title: string;
  testID?: string;
}
export function HeaderTitle({ title, testID }: HeaderTitleProps) {
  return (
    <Text variant="heading05" color="ink.text-primary" testID={testID}>
      {title}
    </Text>
  );
}
