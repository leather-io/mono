import { GestureResponderEvent } from 'react-native';

import { SharedSelectors } from '@/shared/selectors/shared.selectors';
import { useRouter } from 'expo-router';

import { ArrowLeftIcon, IconButton } from '@leather.io/ui/native';

interface HeaderBackButtonProps {
  onPress?(event: GestureResponderEvent): void;
  testID?: string;
}
export function HeaderBackButton({
  onPress,
  testID = SharedSelectors.BackButton,
}: HeaderBackButtonProps) {
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
