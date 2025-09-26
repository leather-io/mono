import { Box } from '@leather.io/ui/native';

interface AssetSelectorHeaderProps {
  children: React.ReactNode;
}

export function AssetSelectorHeader({ children }: AssetSelectorHeaderProps) {
  return (
    <Box px="5" pt="5" mb="3">
      {children}
    </Box>
  );
}
