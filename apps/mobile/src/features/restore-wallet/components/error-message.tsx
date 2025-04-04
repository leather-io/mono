import { t } from '@lingui/macro';

export function constructErrorMessage(invalidWords: string[]) {
  const joinedInvalidWords = invalidWords.join(', ');
  return t({
    id: 'recover_wallet.validation_error',
    message: `Invalid words: ${joinedInvalidWords}`,
  });
}
