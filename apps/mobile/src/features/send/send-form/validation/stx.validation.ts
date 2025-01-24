import { t } from '@lingui/macro';

import { StacksErrorKey } from '@leather.io/stacks';
import { match } from '@leather.io/utils';

export function formatStacksError(errorMessage: StacksErrorKey) {
  return match<StacksErrorKey>()(errorMessage, {
    // maybe different error messages for same address?
    InvalidAddress: t({
      id: 'stacks-error.invalid-address',
      message: 'Invalid address',
    }),
    InvalidNetworkAddress: t({
      id: 'stacks-error.invalid-address',
      message: 'Address is for incorrect network',
    }),
    InvalidSameAddress: t({
      id: 'stacks-error.invalid-same-address',
      message: 'Cannot send to yourself',
    }),
    InsufficientFunds: t({
      id: 'stacks-error.insufficient-funds',
      message: 'Insufficient funds',
    }),
  });
}

// export function complianceValidator(
//   shouldCheckCompliance: yup.StringSchema<string | undefined, yup.AnyObject>,
//   network: NetworkModes
// ) {
//   return yup.string().test({
//     message: 'Compliance check failed',
//     async test(value) {
//       if (network !== 'mainnet') return true;
//       if (!shouldCheckCompliance.isValidSync(value)) return true;
//       if (isUndefined(value) || isEmptyString(value)) return true;

//       try {
//         const resp = await checkEntityAddressIsCompliant(value);
//         return !resp.isOnSanctionsList;
//       } catch (e) {
//         return true;
//       }
//     },
//   });
// }
