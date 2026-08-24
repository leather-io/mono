import { bitcoinStakingContent } from '~/content/bitcoin-staking-content';

import { ByosmSignerManagerState } from './use-byosm-signer-manager';

const byosmContent = bitcoinStakingContent.byosm;

const validationErrorMessages = {
  'not-found': byosmContent.errors.notFound,
  'missing-functions': byosmContent.errors.missingFunctions,
  'not-registered': byosmContent.errors.notRegistered,
};

export function getStateErrorMessage(state: ByosmSignerManagerState): string | null {
  if (state.status === 'invalid-format') {
    return state.reason === 'wrong-network'
      ? byosmContent.errors.wrongNetwork
      : byosmContent.errors.invalidFormat;
  }
  if (state.status === 'check-failed') return byosmContent.errors.checkFailed;
  if (state.status === 'invalid') return validationErrorMessages[state.validation.reason];
  return null;
}
