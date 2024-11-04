import { Account } from '@/store/accounts/accounts';
import { ParamListBase } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { useTheme } from '@shopify/restyle';

import { Theme } from '@leather.io/ui/native';

import { SelectAccount } from './send-sheets/select-account';
import { SelectAsset } from './send-sheets/select-asset';

export interface SendSheetNavigatorParamList extends ParamListBase {
  'send-select-account': undefined;
  'send-select-asset': { account: Account };
}

const Stack = createStackNavigator<SendSheetNavigatorParamList>();

export function SendSheetNavigator() {
  const theme = useTheme<Theme>();
  return (
    <Stack.Navigator
      initialRouteName="send-select-account"
      screenOptions={{
        headerShown: false,
        cardStyle: {
          backgroundColor: theme.colors['ink.background-primary'],
          overflow: 'visible',
        },
      }}
    >
      <Stack.Screen name="send-select-account" component={SelectAccount} />
      <Stack.Screen name="send-select-asset" component={SelectAsset} />
    </Stack.Navigator>
  );
}
