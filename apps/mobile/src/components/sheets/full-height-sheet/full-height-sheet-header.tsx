import { ReactNode } from 'react';

import { Screen } from '@/components/screen/screen';
import { HeaderTitleWithSubtitle } from '@/components/screen/screen-header/components/header-title-with-subtitle';

interface FullHeightSheetHeaderProps {
  title: string;
  subtitle?: string;
  leftElement?: ReactNode;
  rightElement?: ReactNode;
}
export function FullHeightSheetHeader({
  title,
  subtitle,
  leftElement,
  rightElement,
}: FullHeightSheetHeaderProps) {
  return (
    <Screen.Header
      leftElement={leftElement ?? null}
      centerElement={<HeaderTitleWithSubtitle title={title} subtitle={subtitle} />}
      rightElement={rightElement}
    />
  );
}
