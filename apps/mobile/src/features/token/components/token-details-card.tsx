import { Box, HasChildren, Text } from '@leather.io/ui/native';

export function TokenDetailsWrapper({ children }: HasChildren) {
  return (
    <Box gap="1" backgroundColor="ink.background-secondary">
      {children}
    </Box>
  );
}
interface TokenDetailsCardProps extends HasChildren {
  title: React.ReactNode;
}
export function TokenDetailsCard({ children, title }: TokenDetailsCardProps) {
  return (
    <Box backgroundColor="ink.background-primary" p="5">
      {typeof title === 'string' ? (
        <Text variant="label03" py="2">
          {title}
        </Text>
      ) : (
        title
      )}
      {children}
    </Box>
  );
}
