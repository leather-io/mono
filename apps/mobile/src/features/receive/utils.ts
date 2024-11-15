import { Account } from '@/store/accounts/accounts';
import {
  NavigationProp,
  ParamListBase,
  RouteProp,
  useNavigation,
  useRoute,
} from '@react-navigation/native';

export interface ReceiveSheetNavigatorParamList {
  'receive-select-account': undefined;
  'receive-select-asset': { account: Account };
}

export type ReceiveSheetRouteKeys = keyof ReceiveSheetNavigatorParamList;

export type ReceiveSheetRouteProp<RouteKey extends ReceiveSheetRouteKeys> = RouteProp<
  ReceiveSheetNavigatorParamList & ParamListBase,
  RouteKey
>;
export function useReceiveSheetRoute<RouteKey extends ReceiveSheetRouteKeys>() {
  return useRoute<ReceiveSheetRouteProp<RouteKey>>();
}

export function useReceiveSheetNavigation<RouteKey extends ReceiveSheetRouteKeys>() {
  return useNavigation<NavigationProp<ReceiveSheetNavigatorParamList, RouteKey>>();
}

export type CreateCurrentReceiveRoute<RouteKey extends ReceiveSheetRouteKeys> = RouteKey;
