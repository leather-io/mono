import { ReactNode } from 'react';

import { Text } from '@leather.io/ui/native';

interface HeaderTitleProps {
  title: string | ReactNode;
  testID?: string;
}
export function HeaderTitle({ title, testID }: HeaderTitleProps) {
  return (
    <Text variant="heading05" color="ink.text-primary" testID={testID}>
      {title}
    </Text>
  );
}

export function HeaderSubtitle({ title }: HeaderTitleProps) {
  return (
    <Text variant="label03" color="ink.text-subdued">
      {title}
    </Text>
  );
}
