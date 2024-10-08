import { ArrowLeftIcon, TouchableOpacity } from '@leather.io/ui/native';

interface BackButtonHeaderProps {
  onPress?(): void;
  testID?: string;
}

export function BackButtonHeader({ onPress, testID }: BackButtonHeaderProps) {
  return (
    <TouchableOpacity onPress={onPress} p="3" testID={testID}>
      <ArrowLeftIcon />
    </TouchableOpacity>
  );
}
