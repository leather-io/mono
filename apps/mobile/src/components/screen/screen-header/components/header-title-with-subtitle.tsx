import { ReactNode } from 'react';

import { BoxProps, Stack } from '@leather.io/ui/native';

import { HeaderSubtitle, HeaderTitle } from './header-title';

interface HeaderTitleWithSubtitleProps extends BoxProps {
  title: string | ReactNode;
  subtitle?: string | ReactNode;
  testID?: string;
}
export function HeaderTitleWithSubtitle({
  title,
  subtitle,
  testID,
  ...props
}: HeaderTitleWithSubtitleProps) {
  return (
    <Stack alignItems="center" justifyContent="center" {...props}>
      {typeof title === 'string' ? <HeaderTitle title={title} testID={testID} /> : title}
      {typeof subtitle === 'string' ? <HeaderSubtitle title={subtitle} /> : subtitle}
    </Stack>
  );
}
