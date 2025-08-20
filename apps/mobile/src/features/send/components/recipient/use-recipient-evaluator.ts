import {
  isNewAddress,
  recipientSchemaResultContainsError,
} from '@/features/send/components/recipient/recipient.utils';
import { useAccountHelpers } from '@/features/send/components/recipient/use-account-helpers';
import { t } from '@lingui/core/macro';
import { ZodSchema } from 'zod';

import { FungibleCryptoAsset, SendAssetActivity } from '@leather.io/models';

type GuardReason =
  | 'newRecipient'
  | 'recipientIsPayer'
  | 'incorrectNetworkAddress'
  | 'nonCompliantAddress';

interface GuardResultOk {
  severity: 'none';
}

interface GuardResultWarnOrBlock {
  severity: 'warn' | 'block';
  address: string;
  reason: GuardReason;
  title: string;
  description: string;
  primaryActionLabel?: string;
  secondaryActionLabel?: string;
}

export type GuardResult = GuardResultOk | GuardResultWarnOrBlock;

interface CreateRecipientEvaluatorParams {
  schema: ZodSchema;
  isNewAddress: (address: string) => boolean;
  canSelfSend: boolean;
}

export function createRecipientEvaluator({
  canSelfSend,
  isNewAddress,
  schema,
}: CreateRecipientEvaluatorParams) {
  return async function evaluateRecipient(address: string): Promise<GuardResult> {
    const validationResult = await schema.safeParseAsync(address);
    const newRecipient = isNewAddress(address);

    if (recipientSchemaResultContainsError(validationResult, 'recipientIsPayer')) {
      if (canSelfSend) {
        return {
          address,
          reason: 'recipientIsPayer',
          severity: 'warn',
          title: t`Sending to the same address`,
          description: t`This merges your existing funds into a single output. It incurs a fee but helps reduce fees in future transactions. Only proceed if that’s your intent.`,
        };
      } else {
        return {
          address,
          reason: 'recipientIsPayer',
          severity: 'block',
          title: t`Can’t send to the same address`,
          description: t`Sending to your own address isn’t supported. Choose a different address.`,
        };
      }
    }

    if (recipientSchemaResultContainsError(validationResult, 'incorrectNetworkAddress')) {
      return {
        address,
        reason: 'incorrectNetworkAddress',
        severity: 'block',
        title: t`Address from another network`,
        description: t`This address belongs to a different network. Use an address that matches the active network.`,
      };
    }

    if (recipientSchemaResultContainsError(validationResult, 'nonCompliantAddress')) {
      return {
        address,
        reason: 'nonCompliantAddress',
        severity: 'block',
        title: t`Address blocked`,
        description: t`This address is linked to activity that violates compliance policies. You can’t send funds to it`,
      };
    }

    if (newRecipient) {
      return {
        address,
        reason: 'newRecipient',
        severity: 'warn',
        title: t`Verify full address`,
        description: t`You haven’t sent to this address before. Double-check that it’s correct before proceeding.`,
      };
    }

    return {
      severity: 'none',
    };
  };
}

interface UseRecipientEvaluatorParams {
  asset: FungibleCryptoAsset;
  recipientSchema: ZodSchema;
  activity?: SendAssetActivity[];
}

export function useRecipientEvaluator({
  activity = [],
  asset,
  recipientSchema,
}: UseRecipientEvaluatorParams) {
  const { findAccountByAddress } = useAccountHelpers(asset);

  const evaluateRecipient = createRecipientEvaluator({
    schema: recipientSchema,
    canSelfSend: asset.chain === 'bitcoin',
    isNewAddress: (address: string) =>
      isNewAddress({ address, findAccountByAddress, activity: activity }),
  });

  return { evaluateRecipient };
}
