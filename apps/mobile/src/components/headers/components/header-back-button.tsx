import { ArrowLeftIcon, TouchableOpacity } from '@leather.io/ui/native';

interface HeaderBackButtonProps {
  onPress?(): void;
  testID?: string;
}
export function HeaderBackButton({ onPress, testID }: HeaderBackButtonProps) {
  return (
    <TouchableOpacity onPress={onPress} p="3" testID={testID}>
      <ArrowLeftIcon />
    </TouchableOpacity>
  );
}
