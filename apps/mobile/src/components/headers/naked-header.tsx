import { TestId } from '@/shared/test-id';
import { useRouter } from 'expo-router';

import { HeaderBackButton } from './components/header-back-button';
import { HeaderLayout } from './header.layout';

export function NakedHeader() {
  const router = useRouter();
  return (
    <HeaderLayout
      leftElement={<HeaderBackButton onPress={() => router.back()} testID={TestId.backButton} />}
    />
  );
}
