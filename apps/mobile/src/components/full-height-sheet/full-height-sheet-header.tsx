import { ReactNode } from 'react';

import { HeaderTitleWithSubtitle } from '../headers/components/header-title-with-subtitle';
import { HeaderLayout } from '../headers/header.layout';

interface FullHeightSheetHeaderProps {
  title: string;
  subtitle?: string;
  leftElement?: ReactNode;
  rightElement?: ReactNode;
  testID?: string;
}
export function FullHeightSheetHeader({
  title,
  subtitle,
  leftElement,
  rightElement,
  testID,
}: FullHeightSheetHeaderProps) {
  return (
    <HeaderLayout
      leftElement={leftElement}
      centerElement={<HeaderTitleWithSubtitle title={title} subtitle={subtitle} testID={testID} />}
      rightElement={rightElement}
    />
  );
}
