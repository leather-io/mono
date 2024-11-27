import { Box, Text } from '@leather.io/ui/native';

export interface AccountOverviewProps {
  caption: string;
  heading: React.ReactNode;
  icon: React.ReactNode;
}

export function AccountOverview({ caption, icon, heading }: AccountOverviewProps) {
  return (
    <Box
      alignItems="flex-start"
      alignContent="flex-start"
      alignSelf="stretch"
      mx="5"
      flexWrap="wrap"
    >
      <Box width={342} height={180} flexDirection="column" alignItems="center" gap="3" flex={1}>
        <Box p="2" borderRadius="round" backgroundColor="ink.text-primary">
          {icon}
        </Box>
        <Box gap="1" flexDirection="column" alignItems="center">
          {heading}
          <Text variant="caption01">{caption}</Text>
        </Box>
      </Box>
    </Box>
  );
}
