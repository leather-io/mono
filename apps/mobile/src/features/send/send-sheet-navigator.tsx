import { Account } from '@/store/accounts/accounts';
import { ParamListBase } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { useTheme } from '@shopify/restyle';

import { Theme } from '@leather.io/ui/native';

import { SelectAccountSheet } from './send-sheets/select-account-sheet';
import { SelectAssetSheet } from './send-sheets/select-asset-sheet';
import { SendFormBtcSheet } from './send-sheets/send-form-btc-sheet';
import { SendFormStxSheet } from './send-sheets/send-form-stx-sheet';

export interface SendSheetNavigatorParamList extends ParamListBase {
  'send-select-account': undefined;
  'send-select-asset': { account: Account };
  'send-form-btc': { account: Account };
  'send-form-stx': { account: Account };
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
      <Stack.Screen name="send-select-account" component={SelectAccountSheet} />
      <Stack.Screen name="send-select-asset" component={SelectAssetSheet} />
      <Stack.Screen name="send-form-btc" component={SendFormBtcSheet} />
      <Stack.Screen name="send-form-stx" component={SendFormStxSheet} />
    </Stack.Navigator>
  );
}
