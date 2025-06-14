import { TestId } from '@/shared/test-id';

import { ArrowLeftIcon, IconButton } from '@leather.io/ui/native';

interface HeaderBackButtonProps {
  onPress?(): void;
  testID?: string;
}
export function HeaderBackButton({ onPress, testID = TestId.backButton }: HeaderBackButtonProps) {
  return <IconButton label="" icon={<ArrowLeftIcon />} testID={testID} onPress={onPress} />;
}
