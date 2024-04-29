import { AllowAdditionalProperties } from '@leather-wallet/models';

import { DefineRpcMethod, RpcRequest, RpcResponse } from '../rpc';

export type PaymentTypes = 'p2pkh' | 'p2sh' | 'p2wpkh-p2sh' | 'p2wpkh' | 'p2tr';

export interface BtcAddress extends AllowAdditionalProperties {
  type: PaymentTypes;
  address: string;
}

export interface AddressResponseBody extends AllowAdditionalProperties {
  addresses: BtcAddress[];
}

export type GetAddressesRequest = RpcRequest<'getAddresses'>;

export type GetAddressesResponse = RpcResponse<AddressResponseBody>;

export type DefineGetAddressesMethod = DefineRpcMethod<GetAddressesRequest, GetAddressesResponse>;
