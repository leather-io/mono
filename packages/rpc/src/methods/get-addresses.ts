import { AllowAdditionalProperties } from '@leather.io/models';

import { DefineRpcMethod, RpcRequest, RpcResponse } from '../rpc/schemas';

export type PaymentTypes = 'p2pkh' | 'p2sh' | 'p2wpkh-p2sh' | 'p2wpkh' | 'p2tr';

export interface BtcAddressBase extends AllowAdditionalProperties {
  symbol: 'BTC';
  type: PaymentTypes;
  address: string;
  publicKey: string;
  derivationPath: string;
}

export interface NativeSegwitAddress extends BtcAddressBase {
  type: 'p2wpkh';
}

export interface TaprootAddress extends BtcAddressBase {
  type: 'p2tr';
  tweakedPublicKey: string;
}

export type BtcAddress = NativeSegwitAddress | TaprootAddress;

export interface StxAddress extends AllowAdditionalProperties {
  symbol: 'STX';
  address: string;
  publicKey: string;
}

export type Address = BtcAddress | StxAddress;

export interface AddressResponseBody extends AllowAdditionalProperties {
  addresses: Address[];
}

export type GetAddressesRequest = RpcRequest<'getAddresses'>;

export type GetAddressesResponse = RpcResponse<AddressResponseBody>;

export type DefineGetAddressesMethod = DefineRpcMethod<GetAddressesRequest, GetAddressesResponse>;
