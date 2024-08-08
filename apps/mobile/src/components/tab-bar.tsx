import { Box, Text, TouchableOpacity } from '@leather.io/ui/native';

export const TAB_BAR_HEIGHT = 60;

function getBorderColor(isActive: boolean) {
  return isActive ? 'ink.action-primary-default' : 'ink.border-default';
}
function getTextColor(isActive: boolean) {
  return isActive ? 'ink.text-primary' : 'ink.text-subdued';
}
interface Tab {
  onPress(): void;
  title: string;
  isActive: boolean;
}
interface TabBarProps {
  tabs: Tab[];
}
export function TabBar({ tabs }: TabBarProps) {
  return (
    <Box
      flexDirection="row"
      alignItems="center"
      justifyContent="space-between"
      height={TAB_BAR_HEIGHT}
    >
      {tabs.map(tab => (
        <TouchableOpacity
          key={tab.title}
          onPress={tab.onPress}
          height="100%"
          flex={1}
          alignItems="center"
          justifyContent="center"
          borderBottomWidth={4}
          borderColor={getBorderColor(tab.isActive)}
        >
          <Text variant="label01" color={getTextColor(tab.isActive)}>
            {tab.title}
          </Text>
        </TouchableOpacity>
      ))}
    </Box>
  );
}
