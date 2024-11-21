import { LayoutChangeEvent } from 'react-native';

import { Box, Text, TouchableOpacity } from '@leather.io/ui/native';

interface AccountCardProps {
  address: React.ReactNode;
  balance: React.ReactNode;
  icon: React.ReactNode;
  name: string;
  onPress?(): void;
  onLongPress?(): void;
  onLayout?(e: LayoutChangeEvent): void;
  testID?: string;
  iconTestID?: string;
}
export function AccountCard({
  address,
  balance,
  icon,
  name,
  onPress,
  onLongPress,
  onLayout,
  testID,
  iconTestID,
}: AccountCardProps) {
  const Container = onPress ? TouchableOpacity : Box;

  return (
    <Container
      onPress={onPress}
      onLongPress={onLongPress}
      flexDirection="column"
      p="5"
      borderRadius="sm"
      borderWidth={1}
      borderColor="ink.border-transparent"
      backgroundColor="ink.background-primary"
      onLayout={onLayout}
      testID={testID}
    >
      <Box
        mb="6"
        p="2"
        alignSelf="flex-start"
        borderRadius="round"
        bg="ink.text-primary"
        testID={iconTestID}
      >
        {icon}
      </Box>
      <Box flexDirection="row" justifyContent="space-between">
        <Text variant="label01">{name}</Text>
        <Box>
          {balance}
          {address}
        </Box>
      </Box>
    </Container>
  );
}
