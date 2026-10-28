import { ReactNode } from 'react';

import { Pressable, Text } from '@leather.io/ui/native';

interface ToolbarButtonProps {
  onPress(): void;
  icon: ReactNode;
  label: string;
  testID: string;
}

export function ToolbarButton({ onPress, icon, label, testID }: ToolbarButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      py="3"
      gap="1"
      flexDirection="row"
      justifyContent="center"
      alignItems="center"
      testID={testID}
    >
      {icon}
      <Text variant="label03">{label}</Text>
    </Pressable>
  );
}
