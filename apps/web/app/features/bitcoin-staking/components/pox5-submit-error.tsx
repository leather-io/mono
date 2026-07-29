import { ErrorLabel } from '~/components/error-label';
import { bitcoinStakingContent } from '~/content/bitcoin-staking-content';

import type { FlagProps } from '@leather.io/ui';

import { isUserRejectionError } from '../transactions/pox5-tx-status';

interface Pox5SubmitErrorProps extends Omit<FlagProps, 'children'> {
  error: unknown;
}

export function Pox5SubmitError({ error, ...rest }: Pox5SubmitErrorProps) {
  if (!error) return null;

  const { submitErrors } = bitcoinStakingContent.transactionStatus;

  return (
    <ErrorLabel data-testid="pox5-submit-error" {...rest}>
      {isUserRejectionError(error) ? submitErrors.rejected : submitErrors.unknown}
    </ErrorLabel>
  );
}
