import { ReactNode } from 'react';

import { TestId } from '@/shared/test-id';
import { useRouter } from 'expo-router';

import { HeaderBackButton } from './components/header-back-button';
import { HeaderTitle } from './components/header-title';
import { HeaderLayout } from './header.layout';

interface AnimatedTitleHeaderProps {
  title: string;
  rightElement?: ReactNode;
}
export function AnimatedTitleHeader({ title, rightElement }: AnimatedTitleHeaderProps) {
  const router = useRouter();

  return (
    <HeaderLayout
      leftElement={<HeaderBackButton onPress={() => router.back()} testID={TestId.backButton} />}
      centerElement={<HeaderTitle title={title} />}
      rightElement={rightElement}
    />
  );
}
