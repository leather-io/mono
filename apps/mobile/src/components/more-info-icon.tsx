import { Pressable, QuestionCircleIcon, legacyTouchablePressEffect } from '@leather.io/ui/native';

interface MoreInfoIconProps {
  onPress(): void;
}
export function MoreInfoIcon({ onPress }: MoreInfoIconProps) {
  return (
    <Pressable onPress={onPress} pressEffects={legacyTouchablePressEffect} hitSlop={12}>
      <QuestionCircleIcon variant="small" />
    </Pressable>
  );
}
