import { useSendFlowContext } from '@/features/send/send-flow-provider';
import { SendableAsset } from '@/features/send/types';
import { Account } from '@/store/accounts/accounts';
import { NavigationProp, RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { useTheme } from '@shopify/restyle';

import { HasChildren, Theme } from '@leather.io/ui/native';

// Required to use a type alias: https://reactnavigation.org/docs/typescript#typechecking-the-navigator
// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
type SendStackParamList = {
  'select-account'?: { previousRoute: SendRouteKey };
  'select-asset'?: { previousRoute: SendRouteKey };
  form?: {
    previousRoute: SendRouteKey;
    assetItemElementInitialOffset?: number | null;
  };
  approval: { hex: string };
};

type SendRouteKey = keyof SendStackParamList;

export const SendStack = createStackNavigator<SendStackParamList>();

export function SendNavigator({ children }: HasChildren) {
  const {
    state: { selectedAccount, selectedAsset, accounts },
  } = useSendFlowContext();
  const initialRouteName = getInitialRouteName({
    selectedAccount,
    selectedAsset,
    totalAccountNumber: accounts.length,
  });
  const theme = useTheme<Theme>();

  return (
    <SendStack.Navigator
      initialRouteName={initialRouteName}
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: theme.colors['ink.background-primary'] },
        cardStyleInterpolator: ({ current }) => ({
          cardStyle: { opacity: current.progress },
        }),
      }}
    >
      {children}
    </SendStack.Navigator>
  );
}

export function useSendNavigation() {
  return useNavigation<NavigationProp<SendStackParamList>>();
}

export function useSendRoute<RouteKey extends SendRouteKey>() {
  return useRoute<RouteProp<SendStackParamList, RouteKey>>();
}

interface DeriveInitialRouteParams {
  selectedAccount: Account | null;
  selectedAsset: SendableAsset | null;
  totalAccountNumber: number;
}

function getInitialRouteName({
  selectedAccount,
  selectedAsset,
  totalAccountNumber,
}: DeriveInitialRouteParams): SendRouteKey {
  if (!selectedAsset) {
    return 'select-asset';
  }

  if (!selectedAccount) {
    return totalAccountNumber > 1 ? 'select-account' : 'form';
  }

  return 'form';
}
