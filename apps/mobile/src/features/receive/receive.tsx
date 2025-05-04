import { SheetNavigationContainer } from '@/core/sheet-navigation-container';
import { ParamListBase } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { useTheme } from '@shopify/restyle';

import { Theme } from '@leather.io/ui/native';

import { AssetDetails } from './screens/asset-details';
import { SelectAccount } from './screens/select-account';
import { SelectAsset } from './screens/select-asset';
import { ReceiveSheetNavigatorParamList } from './utils';

const Stack = createStackNavigator<ReceiveSheetNavigatorParamList & ParamListBase>();

export function Receive() {
  const theme = useTheme<Theme>();
  return (
    <SheetNavigationContainer>
      <Stack.Navigator
        initialRouteName="select-account"
        screenOptions={{
          headerShown: false,
          cardStyle: {
            backgroundColor: theme.colors['ink.background-primary'],
            overflow: 'visible',
          },
          cardStyleInterpolator: ({ current }) => ({
            cardStyle: { opacity: current.progress },
          }),
        }}
      >
        <Stack.Screen name="select-account" component={SelectAccount} />
        <Stack.Screen name="select-asset" component={SelectAsset} />
        <Stack.Screen name="asset-details" component={AssetDetails} />
      </Stack.Navigator>
    </SheetNavigationContainer>
  );
}
