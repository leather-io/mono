import { ErrorLabel } from '~/components/error-label';
import { bitcoinStakingContent } from '~/content/bitcoin-staking-content';
import { WalletProviderUnavailableError, isUserRejectionError } from '~/utils/wallet';

import type { FlagProps } from '@leather.io/ui';

interface Pox5SubmitErrorProps extends Omit<FlagProps, 'children'> {
  error: unknown;
}

function getSubmitErrorMessage(error: unknown) {
  const { submitErrors } = bitcoinStakingContent.transactionStatus;
  if (error instanceof WalletProviderUnavailableError) return submitErrors.walletUnavailable;
  if (isUserRejectionError(error)) return submitErrors.rejected;
  return submitErrors.unknown;
}

export function Pox5SubmitError({ error, ...rest }: Pox5SubmitErrorProps) {
  if (!error) return null;

  return (
    <ErrorLabel data-testid="pox5-submit-error" {...rest}>
      {getSubmitErrorMessage(error)}
    </ErrorLabel>
  );
}
