import { Box, Text } from '@leather.io/ui/native';

export interface AccountOverviewProps {
  caption: string;
  heading: React.ReactNode;
  icon: React.ReactNode;
}

export function AccountOverview({ caption, icon, heading }: AccountOverviewProps) {
  return (
    <Box alignItems="center" alignContent="center" alignSelf="stretch" flexWrap="wrap">
      <Box height={180} mx="5" flexDirection="column" alignItems="center" gap="3" flex={1}>
        <Box
          p="3"
          borderRadius="round"
          backgroundColor="ink.text-primary"
          justifyContent="center"
          alignItems="center"
        >
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
