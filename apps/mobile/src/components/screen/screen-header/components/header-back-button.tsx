import { GestureResponderEvent } from 'react-native';

import { TestId } from '@/shared/test-id';
import { useRouter } from 'expo-router';

import { ArrowLeftIcon, IconButton } from '@leather.io/ui/native';

interface HeaderBackButtonProps {
  onPress?(event: GestureResponderEvent): void;
  testID?: string;
}
export function HeaderBackButton({ onPress, testID = TestId.backButton }: HeaderBackButtonProps) {
  const { back, canGoBack, navigate } = useRouter();

  function handlePress(event: GestureResponderEvent) {
    if (event.defaultPrevented) return;

    onPress?.(event);

    if (canGoBack()) {
      back();
    } else {
      navigate('/');
    }
  }

  return <IconButton label="" icon={<ArrowLeftIcon />} testID={testID} onPress={handlePress} />;
}
