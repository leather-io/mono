import { Pressable, Text } from '@leather.io/ui/native';

import { TAB_WIDTH } from '../constants';

interface TabButtonProps {
  title: string;
  onPress(): void;
  isActive: boolean;
}

export function TabButton({ title, onPress, isActive }: TabButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      width={TAB_WIDTH}
      py="4"
      justifyContent="center"
      alignItems="center"
    >
      <Text variant="label01" color={isActive ? 'ink.text-primary' : 'ink.text-subdued-secondary'}>
        {title}
      </Text>
    </Pressable>
  );
}
