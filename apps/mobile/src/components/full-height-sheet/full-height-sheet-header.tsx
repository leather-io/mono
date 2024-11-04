import { ReactNode } from 'react';

import { HeaderTitleWithSubtitle } from '../headers/components/header-title-with-subtitle';
import { HeaderLayout } from '../headers/header.layout';

interface FullHeightSheetHeaderProps {
  title: string;
  subtitle?: string;
  rightElement?: ReactNode;
}
export function FullHeightSheetHeader({
  title,
  subtitle,
  rightElement,
}: FullHeightSheetHeaderProps) {
  return (
    <HeaderLayout
      centerElement={<HeaderTitleWithSubtitle title={title} subtitle={subtitle} />}
      rightElement={rightElement}
    />
  );
}
