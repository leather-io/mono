import { ParamListBase } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { useTheme } from '@shopify/restyle';

import { Theme } from '@leather.io/ui/native';

import { SelectAccount } from './receive-sheets/select-account';
import { SelectAsset } from './receive-sheets/select-asset';
import { ReceiveSheetNavigatorParamList } from './utils';

const Stack = createStackNavigator<ReceiveSheetNavigatorParamList & ParamListBase>();

export function ReceiveSheetNavigator() {
  const theme = useTheme<Theme>();
  return (
    <Stack.Navigator
      initialRouteName="receive-select-account"
      screenOptions={{
        headerShown: false,
        cardStyle: {
          backgroundColor: theme.colors['ink.background-primary'],
          overflow: 'visible',
        },
      }}
    >
      <Stack.Screen name="receive-select-account" component={SelectAccount} />
      <Stack.Screen name="receive-select-asset" component={SelectAsset} />
    </Stack.Navigator>
  );
}
