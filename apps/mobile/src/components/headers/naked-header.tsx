import { TestId } from '@/shared/test-id';
import { useRouter } from 'expo-router';

import { HeaderBackButton } from './components/header-back-button';
import { HeaderLayout } from './header.layout';

interface NakedHeaderProps {
  onGoBack?: () => void;
  rightElement?: React.ReactNode;
  error?: React.ReactNode;
}
export function NakedHeader({ onGoBack, rightElement, error }: NakedHeaderProps) {
  const router = useRouter();

  function goBack() {
    router.back();
  }

  return (
    <HeaderLayout
      error={error}
      leftElement={<HeaderBackButton onPress={onGoBack ?? goBack} testID={TestId.backButton} />}
      rightElement={rightElement}
    />
  );
}
