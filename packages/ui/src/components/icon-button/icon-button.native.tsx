import { ReactNode } from 'react';

import { Pressable, type PressableProps } from '../pressable/pressable.native';

export interface IconButtonProps extends Omit<PressableProps, 'accessibilityLabel'> {
  label: string;
  icon: ReactNode;
}
export function IconButton({ icon, label, disabled, ...pressableProps }: IconButtonProps) {
  return (
    <Pressable
      p="2"
      opacity={disabled ? 0.5 : 1}
      accessibilityLabel={label}
      disabled={disabled}
      {...pressableProps}
    >
      {icon}
    </Pressable>
  );
}
