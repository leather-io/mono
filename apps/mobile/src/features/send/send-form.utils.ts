import { Account } from '@/store/accounts/accounts';
import { t } from '@lingui/macro';
import {
  NavigationProp,
  ParamListBase,
  RouteProp,
  useNavigation,
  useRoute,
} from '@react-navigation/native';

import { BitcoinErrorKey, CoinSelectionUtxo } from '@leather.io/bitcoin';
import { Utxo } from '@leather.io/query';
import { match } from '@leather.io/utils';

export interface SendSheetNavigatorParamList {
  'send-select-account': undefined;
  'send-select-asset': { account: Account };
  'send-form-btc': { account: Account; address: string; publicKey: string };
  'send-form-stx': { account: Account; address: string; publicKey: string };
  'sign-psbt': { psbtHex: string };
  'sign-stacks-tx': { txHex: string; accountId: string };
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

export function createCoinSelectionUtxos(utxos: Utxo[]): CoinSelectionUtxo[] {
  return utxos.map(utxo => ({
    address: utxo.address,
    txid: utxo.txid,
    value: Number(utxo.value),
    vout: utxo.vout,
  }));
}

export function formatBitcoinError(errorMessage: BitcoinErrorKey) {
  return match<BitcoinErrorKey>()(errorMessage, {
    InvalidAddress: t({
      id: 'bitcoin-error.invalid-address',
      message: 'Invalid address',
    }),
    NoInputsToSign: t({
      id: 'bitcoin-error.no-inputs-to-sign',
      message: 'No inputs to sign',
    }),
    NoOutputsToSign: t({
      id: 'bitcoin-error.no-outputs-to-sign',
      message: 'No outputs to sign',
    }),
    InsufficientFunds: t({
      id: 'bitcoin-error.insufficient-funds',
      message: 'Insufficient funds',
    }),
  });
}
