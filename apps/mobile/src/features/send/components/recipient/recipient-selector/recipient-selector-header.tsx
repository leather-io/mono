import { ReactNode } from 'react';

import { Box } from '@leather.io/ui/native';

interface RecipientSelectorHeaderProps {
  children: ReactNode;
}

export function RecipientSelectorHeader(props: RecipientSelectorHeaderProps) {
  return <Box px="5" py="5" pb="4" {...props} />;
}
