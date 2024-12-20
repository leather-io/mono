import { z } from 'zod';

import {
  DefineRpcMethod,
  createRpcRequestSchema,
  createRpcResponseSchema,
  defaultErrorSchema,
} from '../rpc/schemas';

const rpcGetAddressesMethodName = 'getAddresses';

export const bitcoinPaymentTypesSchema = z.enum(['p2pkh', 'p2sh', 'p2wpkh-p2sh', 'p2wpkh', 'p2tr']);
export type BitcoinPaymentTypes = z.infer<typeof bitcoinPaymentTypesSchema>;

/** @deprecated use `BitcoinPaymentTypes` */
export type PaymentTypes = BitcoinPaymentTypes;

//
// Bitcoin
export const btcAddressBaseSchema = z.object({
  symbol: z.literal('BTC'),
  type: bitcoinPaymentTypesSchema,
  address: z.string(),
  publicKey: z.string(),
  derivationPath: z.string(),
});

export type BtcAddressBase = z.infer<typeof btcAddressBaseSchema>;

const nativeSegwitAddressSchema = btcAddressBaseSchema
  .extend({
    type: z.literal('p2wpkh'),
  })
  .passthrough();

export type NativeSegwitAddress = z.infer<typeof nativeSegwitAddressSchema>;

const taprootAddressSchema = btcAddressBaseSchema
  .extend({
    type: z.literal('p2tr'),
    tweakedPublicKey: z.string(),
  })
  .passthrough();

export type TaprootAddress = z.infer<typeof taprootAddressSchema>;

export const btcAddressSchema = z.discriminatedUnion('type', [
  nativeSegwitAddressSchema,
  taprootAddressSchema,
]);

export type BtcAddress = z.infer<typeof btcAddressSchema>;

//
// Stacks
export const stxAddressSchema = z
  .object({
    symbol: z.literal('STX'),
    address: z.string(),
    publicKey: z.string(),
  })
  .passthrough();

export type StxAddress = z.infer<typeof stxAddressSchema>;

export const addressSchema = z.union([btcAddressSchema, stxAddressSchema]);

export type Address = z.infer<typeof addressSchema>;

export const getAddressesRequestSchema = createRpcRequestSchema(rpcGetAddressesMethodName);

export type GetAddressesRequest = z.infer<typeof getAddressesRequestSchema>;

//
// Combined addresses response
export const addressResponseBodySchema = z
  .object({ addresses: z.array(addressSchema) })
  .passthrough();

export const getAddressesResponseSchema = createRpcResponseSchema(
  addressResponseBodySchema,
  defaultErrorSchema
);

export type AddressResponseBody = z.infer<typeof addressResponseBodySchema>;

export type GetAddressesResponse = z.infer<typeof getAddressesResponseSchema>;

export type DefineGetAddressesMethod = DefineRpcMethod<GetAddressesRequest, GetAddressesResponse>;
