import { Box } from '../box/box.native';

export interface AvatarProps {
  children: React.ReactNode;
}
export function Avatar({ children }: AvatarProps) {
  return (
    <Box bg="ink.background-secondary" borderRadius="round" p="2">
      {children}
    </Box>
  );
}
