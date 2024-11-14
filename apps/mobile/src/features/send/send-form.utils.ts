import { Account } from '@/store/accounts/accounts';
import {
  NavigationProp,
  ParamListBase,
  RouteProp,
  useNavigation,
  useRoute,
} from '@react-navigation/native';

export interface SendSheetNavigatorParamList {
  'send-select-account': undefined;
  'send-select-asset': { account: Account };
  'send-form-btc': { account: Account };
  'send-form-stx': { account: Account; address: string; publicKey: string };
  'sign-psbt': { psbtHex: string };
}

export type SendSheetRouteKeys = keyof SendSheetNavigatorParamList;

export type SendSheetRouteProp<RouteKey extends SendSheetRouteKeys> = RouteProp<
  SendSheetNavigatorParamList & ParamListBase,
  RouteKey
>;
export function useSendSheetRoute<RouteKey extends SendSheetRouteKeys>() {
  return useRoute<SendSheetRouteProp<RouteKey>>();
}

export function useSendSheetNavigation<RouteKey extends SendSheetRouteKeys>() {
  return useNavigation<NavigationProp<SendSheetNavigatorParamList, RouteKey>>();
}

export type CreateCurrentSendRoute<RouteKey extends SendSheetRouteKeys> = RouteKey;
