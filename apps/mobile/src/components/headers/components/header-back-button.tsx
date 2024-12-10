import { ArrowLeftIcon, Pressable, legacyTouchablePressEffect } from '@leather.io/ui/native';

interface HeaderBackButtonProps {
  onPress?(): void;
  testID?: string;
}
export function HeaderBackButton({ onPress, testID }: HeaderBackButtonProps) {
  return (
    <Pressable onPress={onPress} p="3" testID={testID} pressEffects={legacyTouchablePressEffect}>
      <ArrowLeftIcon />
    </Pressable>
  );
}
