import { useCallback } from 'react';

import { useToastContext } from '@/components/toast/toast-context';
import { Account } from '@/store/accounts/accounts';
import { t } from '@lingui/macro';
import {
  NavigationProp,
  ParamListBase,
  RouteProp,
  useNavigation,
  useRoute,
} from '@react-navigation/native';
import * as Clipboard from 'expo-clipboard';

import { SelectedAsset } from './receive-sheets/select-asset';

export interface ReceiveSheetNavigatorParamList {
  'receive-select-account': undefined;
  'receive-select-asset': { account: Account };
  'receive-asset-details': { asset: SelectedAsset; accountName: string };
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
