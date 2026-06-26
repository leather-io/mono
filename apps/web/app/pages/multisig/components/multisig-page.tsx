import type { ReactNode } from 'react';

import { Box } from 'leather-styles/jsx';
import { Page } from '~/layouts/page/page';

interface MultisigPageProps {
  title?: ReactNode;
  backTo?: string;
  children: ReactNode;
}

export function MultisigPage({ title, backTo, children }: MultisigPageProps) {
  return (
    <Page>
      <Page.Header title={title} backTo={backTo} />
      <Box mt="space.08">{children}</Box>
    </Page>
  );
}
