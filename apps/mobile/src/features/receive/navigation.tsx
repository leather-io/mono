import { useCallback } from 'react';

import { useToastContext } from '@/components/toast/toast-context';
import { useReceiveFlowContext } from '@/features/receive/receive-flow-provider';
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
  'select-asset': { account: Account; previousRoute?: ReceiveRouteKey };
  'asset-details': { asset: SelectedAsset; accountName: string };
};

type ReceiveRouteKey = keyof ReceiveStackParamList;

export const ReceiveStack = createStackNavigator<ReceiveStackParamList>();

export function ReceiveNavigator({ children }: HasChildren) {
  const {
    state: { selectedAccount, selectedAsset, accounts },
  } = useReceiveFlowContext();
  const theme = useTheme<Theme>();
  const initialRouteName = getInitialRouteName({
    selectedAccount,
    selectedAsset,
    totalAccountNumber: accounts.length,
  });

  return (
    <ReceiveStack.Navigator
      initialRouteName={initialRouteName}
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

interface GetInitialRouteParams {
  selectedAccount: Account | null;
  selectedAsset: SelectedAsset | null;
  totalAccountNumber: number;
}

function getInitialRouteName({
  selectedAccount,
  selectedAsset,
  totalAccountNumber,
}: GetInitialRouteParams): ReceiveRouteKey {
  if (!selectedAccount) {
    return totalAccountNumber > 1 ? 'select-account' : 'select-asset';
  }

  if (!selectedAsset) {
    return 'select-asset';
  }

  return 'asset-details';
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
