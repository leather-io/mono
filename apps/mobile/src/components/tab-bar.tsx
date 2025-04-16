import { Box, Pressable, Text, legacyTouchablePressEffect } from '@leather.io/ui/native';

const tabBarHeight = 56;

function getBorderColor(isActive: boolean) {
  return isActive ? 'ink.action-primary-default' : 'ink.border-default';
}
function getTextColor(isActive: boolean) {
  return isActive ? 'ink.text-primary' : 'ink.text-subdued';
}
interface Tab {
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
        <Pressable
          alignItems="center"
          borderBottomWidth={4}
          borderColor={getBorderColor(tab.isActive)}
          key={tab.title}
          onPress={tab.onPress}
          flex={1}
          height="100%"
          justifyContent="center"
          pressEffects={legacyTouchablePressEffect}
        >
          <Text color={getTextColor(tab.isActive)} variant="label01">
            {tab.title}
          </Text>
        </Pressable>
      ))}
    </Box>
  );
}
