import { Header } from '@/components/headers/header';
import { TestId } from '@/shared/test-id';
import { useRouter } from 'expo-router';

import { HeaderBackButton } from './components/header-back-button';

interface NakedHeaderProps {
  onGoBack?: () => void;
  rightElement?: React.ReactNode;
  topElement?: React.ReactNode;
}
export function NakedHeader({ onGoBack, rightElement, topElement }: NakedHeaderProps) {
  const router = useRouter();

  function goBack() {
    router.back();
  }

  return (
    <Header
      topElement={topElement}
      leftElement={<HeaderBackButton onPress={onGoBack ?? goBack} testID={TestId.backButton} />}
      rightElement={rightElement}
    />
  );
}
