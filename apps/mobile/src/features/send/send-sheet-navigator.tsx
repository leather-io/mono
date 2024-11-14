import { ParamListBase } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { useTheme } from '@shopify/restyle';

import { Theme } from '@leather.io/ui/native';

import { SendSheetNavigatorParamList } from './send-form.utils';
import { SelectAccountSheet } from './send-sheets/select-account-sheet';
import { SelectAssetSheet } from './send-sheets/select-asset-sheet';
import { SendFormBtcSheet } from './send-sheets/send-form-btc-sheet';
import { SendFormStxSheet } from './send-sheets/send-form-stx-sheet';
import { SignPsbt } from './send-sheets/sign-psbt';

const Stack = createStackNavigator<SendSheetNavigatorParamList & ParamListBase>();

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
      <Stack.Screen name="sign-psbt" component={SignPsbt} />
    </Stack.Navigator>
  );
}
