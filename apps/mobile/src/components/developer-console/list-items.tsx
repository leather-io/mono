import {
  ChevronRightIcon,
  Pressable,
  Text,
  legacyTouchablePressEffect,
} from '@leather.io/ui/native';

interface PressableListItemProps {
  onPress?(): void;
  title: string;
  testID?: string;
}

export function PressableListItem({ onPress, title, testID }: PressableListItemProps) {
  const isDisabled = !onPress;
  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      justifyContent="space-between"
      flexDirection="row"
      alignItems="center"
      p="3"
      testID={testID}
      pressEffects={legacyTouchablePressEffect}
    >
      <Text variant="label01" color={isDisabled ? 'ink.text-subdued' : 'ink.text-primary'}>
        {title}
      </Text>
      <ChevronRightIcon variant="small" />
    </Pressable>
  );
}
