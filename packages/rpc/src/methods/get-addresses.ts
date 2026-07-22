import { z } from 'zod';

import { defineRpcEndpoint } from '../rpc/schemas';

export const bitcoinPaymentTypesSchema = z.enum([
  'p2pkh',
  'p2sh',
  'p2wpkh-p2sh',
  'p2wpkh',
  'p2tr',
  'p2wsh',
]);
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
  descriptor: z.string(),
  fingerprint: z.string(),
});

export type BtcAddressBase = z.infer<typeof btcAddressBaseSchema>;

const nativeSegwitAddressSchema = btcAddressBaseSchema.extend({
  type: z.literal('p2wpkh'),
});

export type NativeSegwitAddress = z.infer<typeof nativeSegwitAddressSchema>;

const taprootAddressSchema = btcAddressBaseSchema.extend({
  type: z.literal('p2tr'),
  tweakedPublicKey: z.string(),
});

export type TaprootAddress = z.infer<typeof taprootAddressSchema>;

export const btcPolicyAddressSchema = z.object({
  symbol: z.literal('BTC'),
  type: z.literal('p2wsh'),
  address: z.string(),
  descriptor: z.string(),
});

export type BtcPolicyAddress = z.infer<typeof btcPolicyAddressSchema>;

export const btcAddressSchema = z.discriminatedUnion('type', [
  nativeSegwitAddressSchema,
  taprootAddressSchema,
  btcPolicyAddressSchema,
]);

export type BtcAddress = z.infer<typeof btcAddressSchema>;

//
// Stacks
export const stxSingleSigAddressSchema = z.object({
  symbol: z.literal('STX'),
  kind: z.literal('single-sig'),
  address: z.string(),
  publicKey: z.string(),
});

export type StxSingleSigAddress = z.infer<typeof stxSingleSigAddressSchema>;

export const stxMultisigAddressSchema = z.object({
  symbol: z.literal('STX'),
  kind: z.literal('multisig'),
  address: z.string(),
  threshold: z.number(),
  publicKeys: z.array(z.string()),
});

export type StxMultisigAddress = z.infer<typeof stxMultisigAddressSchema>;

export const stxAddressSchema = z.discriminatedUnion('kind', [
  stxSingleSigAddressSchema,
  stxMultisigAddressSchema,
]);

export type StxAddress = z.infer<typeof stxAddressSchema>;

export const addressSchema = z.union([btcAddressSchema, stxAddressSchema]);

export type Address = z.infer<typeof addressSchema>;

export const singleSigAddressSchema = z.union([
  nativeSegwitAddressSchema,
  taprootAddressSchema,
  stxSingleSigAddressSchema,
]);

export type SingleSigAddress = z.infer<typeof singleSigAddressSchema>;

//
// Combined addresses response
export const addressResponseBodySchema = z.object({ addresses: z.array(addressSchema) });

export const singleSigAddressResponseBodySchema = z.object({
  addresses: z.array(singleSigAddressSchema),
});

export type SingleSigAddressResponseBody = z.infer<typeof singleSigAddressResponseBodySchema>;

export const getAddressesChainsSchema = z.array(z.enum(['bitcoin', 'stacks'])).nonempty();

export type GetAddressesChain = z.infer<typeof getAddressesChainsSchema>[number];

export const getAddresses = defineRpcEndpoint({
  method: 'getAddresses',
  params: z
    .object({
      network: z.string().optional(),
      allowPolicyAccounts: z.boolean().optional(),
      chains: getAddressesChainsSchema.optional(),
    })
    .optional(),
  result: addressResponseBodySchema,
});
