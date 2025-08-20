import { useSendFlowContext } from '@/features/send/send-flow-provider';
import { NavigationProp, RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import { FungibleCryptoAsset } from '@leather.io/models';
import { HasChildren, useTheme } from '@leather.io/ui/native';

// Required to use a type alias: https://reactnavigation.org/docs/typescript#typechecking-the-navigator
// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
type SendStackParamList = {
  'select-asset'?: { previousRoute: SendRouteKey };
  form?: {
    previousRoute: SendRouteKey;
    assetItemElementInitialOffset?: number | null;
  };
  approval: { hex: string; fingerprint: string; accountIndex: number };
};

type SendRouteKey = keyof SendStackParamList;

export const SendStack = createStackNavigator<SendStackParamList>();

export function SendNavigator({ children }: HasChildren) {
  const {
    state: { selectedAsset },
  } = useSendFlowContext();
  const initialRouteName = getInitialRouteName({
    selectedAsset,
  });
  const theme = useTheme();

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
  selectedAsset: FungibleCryptoAsset | null;
}

function getInitialRouteName({ selectedAsset }: DeriveInitialRouteParams): SendRouteKey {
  if (!selectedAsset) {
    return 'select-asset';
  }

  return 'form';
}
