import { AllowAdditionalProperties } from '../utils';
import { DefineRpcMethod, RpcRequest, RpcResponse } from '../rpc';
import { PaymentTypes } from './get-addresses';

// Implements BIP-322
// https://github.com/bitcoin/bips/blob/master/bip-0322.mediawiki
export type Bip322MessageTypes = 'legacy' | 'bip322';

export interface SignMessageRequestParams extends AllowAdditionalProperties {
  type?: Bip322MessageTypes;
  account?: number;
  message: string;
  paymentType: PaymentTypes;
}

export interface SignMessageResponseBody extends AllowAdditionalProperties {
  /**
   * Base64 encoded signature
   */
  signature: string;

  /**
   * Address that signed the message
   */
  address: string;
}

export type SignMessageRequest = RpcRequest<'signMessage', SignMessageRequestParams>;

export type SignMessageResponse = RpcResponse<SignMessageResponseBody>;

export type DefineSignMessageMethod = DefineRpcMethod<SignMessageRequest, SignMessageResponse>;
