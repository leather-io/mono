import { z } from 'zod';
import { UI_IMPOSED_MAX_STACKING_AMOUNT_USTX } from '~/constants/constants';
import { stxAmountSchema } from '~/utils/validators/stx-amount-validator';

import { BitcoinNetworkModes } from '@leather.io/models';
import { stxToMicroStx } from '@leather.io/utils';

import { ProtocolName } from './types-preset-protocols';

interface SchemaCreationParams {
  networkMode: BitcoinNetworkModes;
  protocolName: ProtocolName;
}

// eslint-disable-next-line no-empty-pattern
export function createValidationSchema({}: SchemaCreationParams) {
  return z.object({
    amount: stxAmountSchema().refine(value => {
      if (value === undefined) return false;
      const enteredAmount = stxToMicroStx(value);
      return enteredAmount.isLessThanOrEqualTo(UI_IMPOSED_MAX_STACKING_AMOUNT_USTX);
    }),
  });
}

export type StackingLiquidFormSchema = z.infer<ReturnType<typeof createValidationSchema>>;
