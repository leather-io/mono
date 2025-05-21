import { Box, HasChildren } from '@leather.io/ui/native';

interface CollectiblesLayoutProps extends HasChildren {
  mode?: 'gallery' | 'widget';
}

export function CollectiblesLayout({ children }: CollectiblesLayoutProps) {
  return (
    <Box flexDirection="column" alignItems="center" paddingHorizontal="5" gap="4" flexWrap="wrap">
      {children}
    </Box>
  );
}
