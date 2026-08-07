import { type ReactNode } from 'react';

import { Box } from 'leather-styles/jsx';

import { isSidePanelPage } from '@shared/utils/side-panel';

interface PageProps {
  children: ReactNode;
  showLogo?: boolean;
}

export function Page({ children }: PageProps) {
  return (
    <Box
      width={isSidePanelPage() ? '100%' : 'pageWidth'}
      maxWidth="pageWidth"
      margin="auto"
      height={{ base: '100%', md: 'fit-content' }}
    >
      {children}
    </Box>
  );
}
