import { useCallback } from 'react';

import { useToastContext } from '@/components/toast/toast-context';
import { Account } from '@/store/accounts/accounts';
import { t } from '@lingui/macro';
import { NavigationProp, RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { useTheme } from '@shopify/restyle';
import * as Clipboard from 'expo-clipboard';

import { HasChildren, Theme } from '@leather.io/ui/native';

import { SelectedAsset } from './screens/select-asset';

// Required to use a type alias: https://reactnavigation.org/docs/typescript#typechecking-the-navigator
// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
export type ReceiveStackParamList = {
  'select-account': undefined;
  'select-asset': { account: Account };
  'asset-details': { asset: SelectedAsset; accountName: string };
};

type ReceiveRouteKey = keyof ReceiveStackParamList;

export const ReceiveStack = createStackNavigator<ReceiveStackParamList>();

export function ReceiveNavigator({ children }: HasChildren) {
  const theme = useTheme<Theme>();

  return (
    <ReceiveStack.Navigator
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
      {children}
    </ReceiveStack.Navigator>
  );
}

export function useReceiveRoute<RouteKey extends ReceiveRouteKey>() {
  return useRoute<RouteProp<ReceiveStackParamList, RouteKey>>();
}

export function useReceiveNavigation() {
  return useNavigation<NavigationProp<ReceiveStackParamList>>();
}

export function useCopyAddress() {
  const { displayToast } = useToastContext();
  const onCopyAddress = useCallback(
    async function onCopyAddress(address: string) {
      await Clipboard.setStringAsync(address);
      return displayToast({
        type: 'success',
        title: t({
          id: 'receive.select_asset.toast_title',
          message: 'Address copied',
        }),
      });
    },
    [displayToast]
  );
  return onCopyAddress;
}
