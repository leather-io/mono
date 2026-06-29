import type { ReactNode } from 'react';

import { Box } from 'leather-styles/jsx';
import { Page } from '~/layouts/page/page';

interface MultisigPageProps {
  title?: ReactNode;
  backTo?: string;
  onBack?(): void;
  children: ReactNode;
}

export function MultisigPage({ title, backTo, onBack, children }: MultisigPageProps) {
  return (
    <Page>
      <Page.Header title={title} backTo={backTo} onBack={onBack} />
      <Box mt="space.08">{children}</Box>
    </Page>
  );
}
