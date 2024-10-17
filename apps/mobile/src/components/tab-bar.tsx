import { Box, Text, TouchableOpacity } from '@leather.io/ui/native';

export const tabBarHeight = 56;

function getBorderColor(isActive: boolean) {
  return isActive ? 'ink.action-primary-default' : 'ink.border-default';
}
function getTextColor(isActive: boolean) {
  return isActive ? 'ink.text-primary' : 'ink.text-subdued';
}
export interface Tab {
  isActive: boolean;
  onPress(): void;
  title: string;
}
interface TabBarProps {
  tabs: Tab[];
}
export function TabBar({ tabs }: TabBarProps) {
  return (
    <Box alignItems="center" bg="ink.background-primary" flexDirection="row" height={tabBarHeight}>
      {tabs.map(tab => (
        <TouchableOpacity
          alignItems="center"
          borderBottomWidth={4}
          borderColor={getBorderColor(tab.isActive)}
          key={tab.title}
          onPress={tab.onPress}
          flex={1}
          height="100%"
          justifyContent="center"
        >
          <Text color={getTextColor(tab.isActive)} variant="label01">
            {tab.title}
          </Text>
        </TouchableOpacity>
      ))}
    </Box>
  );
}
