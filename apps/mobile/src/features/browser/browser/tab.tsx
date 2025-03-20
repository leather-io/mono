import { ReactNode } from 'react';

import { TouchableOpacity } from '@leather.io/ui/native';

interface TabProps {
  children: ReactNode;
  isActive: boolean;
  onPress?: () => void;
}

export function Tab({ children, isActive, onPress }: TabProps) {
  return (
    <TouchableOpacity
      flex={1}
      justifyContent="center"
      alignItems="center"
      borderBottomWidth={1}
      borderColor={isActive ? 'ink.text-subdued' : 'ink.border-default'}
      onPress={onPress}
    >
      {children}
    </TouchableOpacity>
  );
}
