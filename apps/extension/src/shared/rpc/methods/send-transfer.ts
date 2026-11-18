import { z } from 'zod';

import { getNetworkTypeFromAddress } from '@leather.io/bitcoin';
import { type BitcoinNetworkModes } from '@leather.io/models';
import { uniqueArray } from '@leather.io/utils';

import { FormErrorMessages } from '@shared/error-messages';
import { btcAddressNetworkValidator } from '@shared/forms/address-validators';
import { checkIfDigitsOnly } from '@shared/forms/amount-validators';
import { stringField } from '@shared/forms/field-schemas';

import { accountSchema, formatValidationErrors, getRpcParamErrors } from './validation.utils';

export const defaultRpcSendTransferNetwork = 'mainnet';

function defaultNetworkIdToBitcoinNetworkMode(networkId: string): BitcoinNetworkModes | undefined {
  switch (networkId) {
    case 'mainnet':
      return 'mainnet';
    case 'testnet':
    case 'testnet4':
      return 'testnet';
    case 'sbtcTestnet':
    case 'sbtcDevenv':
    case 'devnet':
      return 'regtest';
    case 'signet':
      return 'signet';
    default:
      return undefined;
  }
}

/** @knipignore */
export const rpcSendTransferParamsSchemaLegacy = z.object({
  account: accountSchema.optional(),
  address: z.string(),
  amount: z.string(),
  network: z.string().optional(),
  broadcast: z.boolean().optional(),
});

/** @knipignore */
export const rpcSendTransferParamsSchema = z
  .object({
    account: accountSchema.optional(),
    network: z.string().optional(),
    broadcast: z.boolean().optional(),
    recipients: z
      .array(
        z.object({
          address: z.string(),
          amount: z.string().refine(value => checkIfDigitsOnly(value), {
            error: 'Sat denominated amounts only',
          }),
        })
      )
      .min(1)
      .refine(
        recipients => {
          const inferredNetworksByAddress = recipients.map(({ address }) =>
            getNetworkTypeFromAddress(address)
          );
          return uniqueArray(inferredNetworksByAddress).length === 1;
        },
        { error: 'Cannot transfer to addresses of different networks', path: ['recipients'] }
      ),
  })
  .refine(
    ({ network, recipients }) => {
      if (!network) return true;

      const networkMode = defaultNetworkIdToBitcoinNetworkMode(network);
      if (!networkMode) return true;

      const addressNetworks = recipients.map(
        recipient =>
          stringField().check(btcAddressNetworkValidator(networkMode)).safeParse(recipient.address)
            .success
      );

      return !addressNetworks.some(val => val === false);
    },
    { error: FormErrorMessages.IncorrectNetworkAddress, path: ['recipients'] }
  );

export function convertRpcSendTransferLegacyParamsToNew(
  params: z.infer<typeof rpcSendTransferParamsSchemaLegacy>
) {
  return {
    recipients: [{ address: params.address, amount: params.amount }],
    network: params.network,
    account: params.account,
    broadcast: params.broadcast,
  };
}

export function getRpcSendTransferParamErrors(obj: unknown) {
  return formatValidationErrors(getRpcParamErrors(obj, rpcSendTransferParamsSchema));
}
