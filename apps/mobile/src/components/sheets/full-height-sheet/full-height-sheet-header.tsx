import { ReactNode } from 'react';

import { HeaderTitleWithSubtitle } from '@/components/screen/screen-header/components/header-title-with-subtitle';
import { HeaderLayout } from '@/components/screen/screen-header/components/header.layout';

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
    <HeaderLayout
      leftElement={leftElement}
      centerElement={<HeaderTitleWithSubtitle title={title} subtitle={subtitle} />}
      rightElement={rightElement}
    />
  );
}
