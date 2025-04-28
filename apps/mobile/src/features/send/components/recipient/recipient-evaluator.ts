import { recipientSchemaResultContainsError } from '@/features/send/components/recipient/recipient.utils';
import { t } from '@lingui/macro';
import { ZodSchema } from 'zod';

interface CreateRecipientEvaluatorParams {
  schema: ZodSchema;
  isNewAddress: (address: string) => boolean;
  canSelfSend: boolean;
}

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
          title: t({
            id: 'send-form.guard.same_address_warning_title',
            message: 'Sending to the same address',
          }),
          description: t({
            id: 'send-form.guard.same_address_warning_description',
            message:
              'This merges your existing funds into a single output. It incurs a fee but helps reduce fees in future transactions. Only proceed if that’s your intent.',
          }),
        };
      } else {
        return {
          address,
          reason: 'recipientIsPayer',
          severity: 'block',
          title: t({
            id: 'send-form.guard.same_address_error_title',
            message: 'Can’t send to the same address',
          }),
          description: t({
            id: 'send-form.guard.same_address_error_description',
            message: 'Sending to your own address isn’t supported. Choose a different address.',
          }),
        };
      }
    }

    if (recipientSchemaResultContainsError(validationResult, 'incorrectNetworkAddress')) {
      return {
        address,
        reason: 'incorrectNetworkAddress',
        severity: 'block',
        title: t({
          id: 'send-form.guard.incorrect_network_address_title',
          message: 'Address from another network',
        }),
        description: t({
          id: 'send-form.send-form.guard.incorrect_network_address_description',
          message:
            'This address belongs to a different network. Enter an address that matches the active network.',
        }),
      };
    }

    if (recipientSchemaResultContainsError(validationResult, 'nonCompliantAddress')) {
      return {
        address,
        reason: 'nonCompliantAddress',
        severity: 'block',
        title: t({
          id: 'send-form.guard.non_compliant_address_title',
          message: 'Address blocked',
        }),
        description: t({
          id: 'send-form.send-form.guard.non_compliant_address_description',
          message:
            'This address is linked to activity that violates compliance policies. You can’t send funds to it',
        }),
      };
    }

    if (newRecipient) {
      return {
        address,
        reason: 'newRecipient',
        severity: 'warn',
        title: t({
          id: 'send-form.guard.new_recipient_title',
          message: 'Verify full address',
        }),
        description: t({
          id: 'send-form.guard.new_recipient_description',
          message:
            'You haven’t sent to this address before. Double-check that it’s correct before proceeding.',
        }),
      };
    }

    return {
      severity: 'none',
    };
  };
}
