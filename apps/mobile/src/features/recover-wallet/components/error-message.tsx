import { t } from '@lingui/core/macro';

export function constructErrorMessage(invalidWords: string[]) {
  const joinedInvalidWords = invalidWords.join(', ');
  return t`Invalid words: ${joinedInvalidWords}`;
}
