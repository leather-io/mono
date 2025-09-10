import { Box, HasChildren } from '@leather.io/ui/native';

interface EmptyLayoutProps extends HasChildren {
  image?: React.ReactNode;
}
// TODO: LEA-3190  ask design for this empty layout
export function EmptyLayoutTab({ children, image }: EmptyLayoutProps) {
  return (
    <Box height={648} gap="4" alignItems="center" flexShrink={0}>
      <Box height={200} width={200} alignItems="center" justifyContent="center">
        {image}
      </Box>

      {children}
    </Box>
  );
}

export function EmptyLayout({ children, image }: EmptyLayoutProps) {
  return (
    <Box height={648} gap="4" pt="8" alignItems="center" flexShrink={0}>
      <Box height={270} width={270} alignItems="center" justifyContent="center">
        {image}
      </Box>

      {children}
    </Box>
  );
}
