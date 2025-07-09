import { Box, HasChildren, Text } from '@leather.io/ui/native';

export function TokenDetailsWrapper({ children }: HasChildren) {
  return (
    <Box gap="1" backgroundColor="ink.background-secondary">
      {children}
    </Box>
  );
}
interface TokenDetailsCardProps extends HasChildren {
  title: string;
}
export function TokenDetailsCard({ children, title }: TokenDetailsCardProps) {
  return (
    <Box backgroundColor="ink.background-primary" p="5">
      <Text variant="label03" py="2">
        {title}
      </Text>
      {children}
    </Box>
  );
}
