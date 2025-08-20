import { useReceiveFlowContext } from '@/features/receive/receive-flow-provider';
import { Account } from '@/store/accounts/accounts';
import { NavigationProp, RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import { HasChildren, useTheme } from '@leather.io/ui/native';

import { SelectedAsset } from './screens/select-asset';

// Required to use a type alias: https://reactnavigation.org/docs/typescript#typechecking-the-navigator
// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
export type ReceiveStackParamList = {
  'select-account': undefined;
  'select-asset': { account: Account; previousRoute?: ReceiveRouteKey };
  'asset-details': { asset: SelectedAsset; accountName: string; previousRoute?: ReceiveRouteKey };
};

type ReceiveRouteKey = keyof ReceiveStackParamList;

export const ReceiveStack = createStackNavigator<ReceiveStackParamList>();

export function ReceiveNavigator({ children }: HasChildren) {
  const {
    state: { selectedAsset },
  } = useReceiveFlowContext();
  const theme = useTheme();

  const initialRouteName = getInitialRouteName({
    selectedAsset,
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
  selectedAsset: SelectedAsset | null;
}

function getInitialRouteName({ selectedAsset }: GetInitialRouteParams): ReceiveRouteKey {
  if (selectedAsset) return 'asset-details';
  return 'select-asset';
}
