import { LayoutChangeEvent } from 'react-native';

import { Box, Text, TouchableOpacity } from '@leather.io/ui/native';

interface AccountCardProps {
  address: React.ReactNode;
  balance: React.ReactNode;
  icon: React.ReactNode;
  name: string;
  walletName: string;
  onPress?(): void;
  onLongPress?(): void;
  onLayout?(e: LayoutChangeEvent): void;
  testID?: string;
}
export function AccountCard({
  address,
  balance,
  icon,
  name,
  walletName,
  onPress,
  onLongPress,
  onLayout,
  testID,
}: AccountCardProps) {
  const Container = onPress ? TouchableOpacity : Box;

  return (
    <Container
      onPress={onPress}
      onLongPress={onLongPress}
      flexDirection="column"
      p="5"
      borderRadius="sm"
      gap="6"
      borderWidth={1}
      borderColor="ink.border-transparent"
      backgroundColor="ink.background-primary"
      onLayout={onLayout}
      testID={testID}
    >
      {icon}
      <Box flexDirection="row" justifyContent="space-between">
        <Box>
          <Text variant="label01">{name}</Text>
          <Text variant="caption01" color="ink.text-subdued">
            {walletName}
          </Text>
        </Box>
        <Box>
          {balance}
          {address}
        </Box>
      </Box>
    </Container>
  );
}
